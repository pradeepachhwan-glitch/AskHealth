import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a caring, professional health assistant. Always end with: "This is not a substitute for professional medical advice."' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  })

  const answer = completion.choices[0]?.message?.content || 'Sorry, I couldn’t help right now.'

  return Response.json({ answer })
}