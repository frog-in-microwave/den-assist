import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




export async function POST(req: Request) {


    const {firstName, lastName, birthDate, notes} = await req.json();
    const patient = await prisma.patient.create({
        data: {
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            notes
        }
    });

    return NextResponse.json({
        ststus: 201,
        message: "Patient created successfully",
    })
            
            
}

