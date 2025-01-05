import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req as any)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const {
      businessName,
      description,
      industry,
      targetAudience,
      goals,
      budget,
      challenges,
      marketingChannels,
      additionalNotes,
    } = await req.json()

    const prompt = `Generate a comprehensive marketing plan for the following business:

Business Name: ${businessName}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}
Marketing Goals: ${goals}
Budget: ${budget || "Not specified"}
Current Challenges: ${challenges}
Preferred Marketing Channels: ${marketingChannels}
Additional Notes: ${additionalNotes || "None"}

Please provide a detailed marketing plan that includes:
1. Executive Summary
2. Target Market Analysis
3. Marketing Strategy
4. Channel-specific Tactics
5. Budget Allocation
6. Timeline and Milestones
7. Key Performance Indicators (KPIs)
8. Risk Analysis and Mitigation
9. Implementation Plan

Format the response in a clear, professional manner with sections and bullet points where appropriate.`

    const completion = await anthropic.messages.create({
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-opus-20240229",
    })

    const content = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : ''

    return NextResponse.json({
      plan: content,
    })
  } catch (error) {
    console.error("[MARKETING_PLAN_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
