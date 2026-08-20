import { NextResponse } from 'next/server';
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isAdminConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { status: 'warning', message: 'Supabase not configured', timestamp: new Date().toISOString() },
        { status: 200 }
      );
    }

    // Try a simple query to check database connection
    const { error } = await supabaseAdmin
      .from('affillia_mailing_list')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Health check - Database connection error:', error);
      return NextResponse.json(
        { 
          status: 'warning', 
          message: 'Database connection issue', 
          timestamp: new Date().toISOString() 
        },
        { status: 200 }
      );
    }

    // All checks passed
    return NextResponse.json(
      { status: 'healthy', message: 'Service is healthy', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Service error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}