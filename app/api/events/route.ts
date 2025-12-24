import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({message: 'Event Creation failed', error: error instanceof Error ? error.message : "Unknown"});
    }
}