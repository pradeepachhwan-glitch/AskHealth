'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
    const channel = supabase.channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const askAI = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const { answer } = await res.json()
    alert(answer || 'No response')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-600 text-white p-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold">AskHealth</h1>
          <p className="text-xl mt-2">Your AI-powered health community</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about your health..."
            className="w-full p-4 border rounded-lg text-lg"
            rows={3}
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={askAI}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold text-lg disabled:opacity-70"
            >
              {loading ? 'Thinking...' : 'Ask AI →'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 text-xl">No posts yet — be the first!</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow border">
                <p className="text-lg text-gray-800">{post.body}</p>
                <p className="text-sm text-gray-500 mt-3">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}