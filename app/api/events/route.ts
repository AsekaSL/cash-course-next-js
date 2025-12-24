import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

// /event/nextjs-config-2025

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());

        } catch (error) {
            return NextResponse.json({message: 'Invalid form data format'}, {status: 400});
        }

        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({message: 'Image file is required'}, {status: 400});
        }

        const arrayBuffer = await file.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image' , folder: 'DevEvents'}, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }).end(buffer);
        })

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createEvent = await Event.create(event);

        return NextResponse.json({message: 'Event Created Successfully', event: createEvent}, {status: 201});

    } catch (error) {
        console.error(error);
        return NextResponse.json({message: 'Event Creation failed', error: error instanceof Error ? error.message : "Unknown"}, {status: 500});
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({createdAt: -1});

        return NextResponse.json({message: 'Events fetched successfully', events}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: 'Failed to fetch events', error: error instanceof Error ? error.message : "Unknown"}, {status: 500});
    }
}

// a route that accepts a slug as input -> returns the event details