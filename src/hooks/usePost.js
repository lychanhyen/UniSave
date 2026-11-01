import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('marketplace_posts')
        .select('*')
        .eq('id', postId)
        .single();
      if (error) throw error;
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { post, loading, error };
}