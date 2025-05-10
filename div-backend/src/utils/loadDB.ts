// src/utils/loadDB.ts
import { DataAPIClient } from '@datastax/astra-db-ts';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';
import OpenAi from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Destructure environment variables
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPEN_API_KEY,
} = process.env;

// Initialize OpenAI client with your API key
const openai = new OpenAi({ apiKey: OPEN_API_KEY! });

// Sample data: array of URLs to scrape (using Google Docs URL as in original)
const divData = [
  'https://docs.google.com/document/d/1Om5_BV6jYxsfowgGOQ0HlzxaG8tUbyM0NVJ_-HtZDeI/edit?usp=sharing',
];

// Initialize Astra DB client and get database instance
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE! });

// Initialize a text splitter for dividing the scraped content into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// Function to create a collection with a vector field in Astra DB
const createCollectionIfNotExists = async (similarityMetric: 'dot_product' | 'cosine' | 'euclidean' = 'dot_product') => {
  try {
    const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
      vector: {
        dimension: 1536,
        metric: similarityMetric,
      },
    });
    console.log('Collection creation result:', res);
  } catch (error: any) {
    // Check if the error is because the collection already exists
    if (error.name === 'CollectionAlreadyExistsError') {
      console.log(`Collection ${ASTRA_DB_COLLECTION} already exists, skipping creation.`);
    } else {
      // If it's another error, rethrow it
      throw error;
    }
  }
};

// Function to scrape a web page and return its text content (stripping HTML)
const scrapePage = async (url: string): Promise<string> => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Using a local Chrome installation
    },
    gotoOptions: {
      waitUntil: 'domcontentloaded',
    },
    evaluate: async (page, browser) => {
      // Evaluate the page content and then close the browser
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  try {
    const scraped = await loader.scrape();
    return scraped?.replace(/<[^>]*>?/gm, '') || '';
  } catch (error) {
    console.error('Error scraping page:', error);
    // Provide a more helpful error message
    if (error.toString().includes('Could not find Chrome')) {
      console.error('Chrome not found. Try running: npx puppeteer browsers install chrome');
    }
    throw error;
  }
};

// Function to load sample data into Astra DB
const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION!);
  for (const url of divData) {
    try {
      console.log(`Scraping content from: ${url}`);
      // Scrape the page content
      const content = await scrapePage(url);
      console.log(`Successfully scraped ${content.length} characters`);
      
      // Split the content into smaller text chunks
      const chunks = await splitter.splitText(content);
      console.log(`Created ${chunks.length} chunks`);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          console.log(`Processing chunk ${i+1}/${chunks.length}`);
          // Generate an embedding for each chunk
          const embedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunk,
            encoding_format: 'float',
          });
          const vector = embedding.data[0].embedding;
          // Insert the vector and text into Astra DB
          const res = await collection.insertOne({
            $vector: vector,
            text: chunk,
          });
          console.log(`Inserted chunk ${i+1}/${chunks.length}`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing chunk ${i+1}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error);
    }
  }
};

// Create the collection if it doesn't exist and load sample data sequentially
(async () => {
  try {
    await createCollectionIfNotExists();
    await loadSampleData();
    console.log('Data loading process completed successfully!');
  } catch (error) {
    console.error('Error in data loading process:', error);
  }
})();