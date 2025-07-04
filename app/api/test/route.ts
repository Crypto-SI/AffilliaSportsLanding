import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    const configured = isSupabaseConfigured;
    let connectionTest = false;
    
    if (configured) {
      connectionTest = await testSupabaseConnection();
    }
    
    return NextResponse.json({
      status: 'success',
      supabaseConfigured: configured,
      connectionWorking: connectionTest,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 