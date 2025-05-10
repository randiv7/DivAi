// src/routes/chat.ts
import { Router, Request, Response } from 'express';
import { DataAPIClient } from '@datastax/astra-db-ts';
import OpenAi from 'openai';
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

// Initialize Astra DB client and get database instance
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE! });

const router = Router();

// Helper function to preprocess Sinhala text (normalize)
const preprocessSinhalaText = (text: string): string => {
  // Remove excess whitespace
  return text.replace(/\s+/g, ' ').trim();
};

router.post('/', async (req: Request, res: Response) => {
  try {
    // Parse the request body to extract messages array
    const { messages } = req.body;
    
    // Get only the latest message
    const latestMessage = messages[messages.length - 1]?.content;
    
    // Limit conversation history to last 6 messages (3 exchanges)
    const recentMessages = messages.slice(-6);
    
    // Log user query for debugging
    console.log('User query:', latestMessage);
    
    let docContext = '';
    
    // Generate embedding for the latest message using OpenAI Embedding API
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: preprocessSinhalaText(latestMessage),
      encoding_format: 'float',
    });
    
    try {
      // Get the collection
      const collection = await db.collection(ASTRA_DB_COLLECTION!);
      
      // Implement hybrid search approach
      // 1. Vector search
      const vectorCursor = collection.find(null, {
        sort: { $vector: embedding.data[0].embedding },
        limit: 8, // Increased for better context
      });
      const vectorResults = await vectorCursor.toArray();
      
      // 2. Keyword search (if possible with AstraDB)
      let keywordResults: any[] = [];
      try {
        // This is a simplified approach - AstraDB may require different syntax
        const keywordCursor = collection.find({
          text: { $regex: latestMessage.replace(/[^\w\s]/gi, ' ') }
        }, { limit: 3 });
        keywordResults = await keywordCursor.toArray();
      } catch (keywordErr) {
        console.log('Keyword search not supported or failed, using only vector search');
      }
      
      // Combine results (with deduplication by ID)
      const allResults = [...vectorResults, ...keywordResults];
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item._id.toString(), item])).values()
      );
      
      // Log retrieved chunks for debugging
      console.log('Retrieved chunks:', uniqueResults.map(doc => ({
        id: doc._id.toString(),
        preview: doc.text.substring(0, 100) + '...'
      })));
      
      // Format context better - using array instead of string for cleaner context
      const contextArray = uniqueResults.map((doc: any) => doc.text);
      docContext = contextArray.join('\n\n');
    } catch (err) {
      console.error('Error querying Astra DB:', err);
      docContext = '';
    }
    
    // Improved system prompt for better Sinhala responses
    const systemPrompt = {
      role: 'system',
      content: `
ඔබ විශ්වාසනීය හා මිත්‍රශීලී සිංහල අධ්‍යාපන සහායකයෙකි.ඔබේ නම "DIV-AI". (You are a reliable and friendly Sinhala educational assistant for students.)
     පරිශීලකයා ඔබට"hi, hey,what is up" කිව්වොත්, Hi! මම DIV-AI.ඔබට සහයවිය හැක්කේ කෙසේද? 😊
📌 **සඳහන් උපදෙස් පිළිපදින්න**:

1️⃣ **භූමිකාව**: ශ්‍රේණි 10/11 සිසුන්ට විද්‍යා පාඩම් විවරණය කිරීමේ විශේෂඥයෙකි.

2️⃣ **භාෂාව**: පිළිතුරු **සිංහල භාෂාවෙන් පමණක්** ලබාදෙන්න. (Only respond in Sinhala.)

3️⃣ **සන්දර්භය පමණක් භාවිතා කරන්න**: 
   - CONTEXT තුළ ඇති තොරතුරු වලට පමණක් පිළිතුරු පදනම් විය යුතුය.
   - ඔබගේම දැනුම හෝ අනුමාන භාවිත නොකරන්න.පිලිතුරු ලබාදීමේදී සන්දර්භයේ ඇති වචන ,
   අකුරු එලෙසම භාවිතා කරන්න. වැරදි නොකරන්න.අකුරු වචන ගැන සැලකිලිමත් වෙන්න.

4️⃣ **තොරතුරු නොමැති විට**:
   - "මට ඒ ගැන තොරතුරු නැහැ 😕 " ලෙස පැහැදිලිව පිළිතුරු දෙන්න.

5️⃣ සරල කෙටි පිලිතුරු ලබා දෙන්න.
   පිලිතුරු ලබාදීමේදී සන්දර්භයේ ඇති වචන ,
   අකුරු එලෙසම භාවිතා කරන්න. වැරදි නොකරන්න.අකුරු වචන ගැන සැලකිලිමත් වෙන්න.
   - ප්‍රශ්නය නැවත කියවීමෙන් වළකින්න .**ඍජුව පිළිතුර ලබාදෙන්න**. dont use emojis.

6️⃣ **පිළිතුරු ආකෘතිය**:
   -සරල කෙටි පිලිතුරු ලබාදෙන්න(give short point form answers)

7️⃣ **අනවශ්‍ය විස්තර වලක්වන්න**:
   - අදාළ නොවන තොරතුරු ඇතුළත් නොකරන්න.

----- CONTEXT START -----
${docContext}
----- CONTEXT END -----

QUESTION: ${latestMessage}
      `,
    };
    
    // Call OpenAI chat completions API with streaming enabled and better parameters
    const responseStream = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      stream: true,
      messages: [systemPrompt, ...recentMessages],
      temperature: 0.3, // Lower temperature for more deterministic responses
      max_tokens: 1000, // Allow longer responses when needed
      top_p: 0.9, // More focused token selection
    });
    
    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    
    // Stream data to the client as it arrives (each delta is sent as a separate SSE event)
    (async () => {
      try {
        for await (const chunk of responseStream) {
          const text = chunk.choices[0]?.delta?.content || '';
          // Send each token (delta) exactly as provided
          res.write(`data: ${text}\n\n`);
        }
        // End the stream
        res.end();
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
        // Send an error message to the client
        res.write(`data: පිළිතුරු ලබා දීමේදී දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.\n\n`);
        res.end();
      }
    })();
  } catch (err) {
    console.error('Error in /chat route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;