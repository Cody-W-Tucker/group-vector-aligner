import OpenAI from 'openai'
import { InterviewResponses } from './interview'

let openai: OpenAI | null = null

function getOpenAI() {
	if (!openai) {
		const apiKey = process.env.OPENAI_API_KEY
		if (!apiKey) throw new Error('Missing OPENAI_API_KEY. Please set the OPENAI_API_KEY environment variable.')
		openai = new OpenAI({ apiKey })
	}
	return openai
}

export interface AlignmentSummary {
	purpose: string
	sponsorship: string
	resources: string
	leadership: string
	deliverables: string
	plan: string
	change: string
	investment: string
	benefits: string
	overallAlignment: string
}

export async function generateGroupAlignmentSummary(
	interviews: Array<{
		user_id: string
		responses: InterviewResponses
		completed_at: string
	}>,
	groupId?: string
): Promise<AlignmentSummary> {
	if (!interviews.length) {
		throw new Error('No interviews provided')
	}

	// Query profiles for names
	const { createClient } = await import('@/lib/supabase/server')
	const supabase = await createClient()
	const { data: profiles } = await supabase
		.from('profiles')
		.select('id, email, full_name')
		.in('id', interviews.map(i => i.user_id))
	const userIdToProfile = Object.fromEntries(profiles?.map(p => [p.id, { email: p.email, full_name: p.full_name }]) || [])

	// Query previous summary if groupId provided
	let previousSummary: AlignmentSummary | null = null
	if (groupId) {
		try {
			const { data, error } = await supabase
				.from('dashboard_summaries')
				.select('summary_content')
				.eq('group_id', groupId)
				.eq('section', 'full_summary')
				.order('generated_at', { ascending: false })
				.limit(1)
				.maybeSingle()
			if (error) {
				console.error('Error querying previous summary:', error)
			} else {
				try {
					previousSummary = data?.summary_content ? JSON.parse(data.summary_content) : null
					/* console.log('Found previous summary:', !!previousSummary) */
				} catch (parseError) {
					console.error('Error parsing previous summary JSON:', parseError)
					previousSummary = null
				}
			}
		} catch (error) {
			console.error('Exception querying previous summary:', error)
		}
	}

	const interviewSummaries = interviews.map((interview, index) => {
		const responses = interview.responses
		const profile = userIdToProfile[interview.user_id]
		let name = `Contributor ${index + 1}`
		if (profile) {
			if (profile.full_name && !profile.full_name.includes('@')) {
				name = profile.full_name
			} else if (profile.email) {
				name = profile.email.split('@')[0]
			}
		}
		return `
Contributor ${name} (Completed: ${new Date(interview.completed_at).toLocaleDateString()}):
- Purpose: ${responses.purpose}
- Sponsorship: ${responses.sponsorship.willing ? `Yes - ${responses.sponsorship.how || 'No details'}` : 'No'}
- Resources: ${responses.resources}
- Leadership: ${responses.leadership.willing ? `Yes - ${responses.leadership.how || 'No details'}` : 'No'}
- Deliverables: ${responses.deliverables}
- Plan: ${responses.plan}
- Change: ${responses.change}
- Investment: ${responses.investment}
- Benefits: ${responses.benefits}
`
	}).join('\n')

	const previousContext = previousSummary ? `
Previous Analysis (for context and continuity):
- Purpose: ${previousSummary.purpose}
- Sponsorship: ${previousSummary.sponsorship}
- Resources: ${previousSummary.resources}
- Leadership: ${previousSummary.leadership}
- Deliverables: ${previousSummary.deliverables}
- Plan: ${previousSummary.plan}
- Change: ${previousSummary.change}
- Investment: ${previousSummary.investment}
- Benefits: ${previousSummary.benefits}
- Overall Alignment: ${previousSummary.overallAlignment}

` : ''

	const prompt = `
You are an expert facilitator synthesizing group alignment insights from ${interviews.length} contributors.

${previousContext}Based on the ${previousSummary ? 'previous analysis and ' : ''}following new interview responses, create an updated unified alignment summary that captures the collective vision, commitments, and action plan. ${previousSummary ? 'Integrate the new insights with the previous analysis, maintaining continuity while updating where new information changes the understanding.' : ''}

${interviewSummaries}

Please provide a structured summary with these sections:

1. **Purpose** - Unified vision/mission statement
2. **Sponsorship** - Collective sponsorship commitments
3. **Resources** - Available and needed resources
4. **Leadership** - Leadership structure and commitments
5. **Deliverables** - Key outputs and milestones
6. **Plan** - High-level action plan
7. **Change** - Change management approach
8. **Investment** - Required investments and funding
9. **Benefits** - Expected value and outcomes
10. **Overall Alignment** - Assessment of group readiness and next steps

Keep each section concise (2-4 sentences) but comprehensive. Use collaborative language that reflects the group's collective wisdom.`

	try {
		const completion = await getOpenAI().chat.completions.create({
			model: 'gpt-5-mini-2025-08-07',
			messages: [
				{
					role: 'system',
					content: 'You are an expert at synthesizing group insights and creating actionable alignment summaries.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.7,
			max_tokens: 2000,
		})

		const content = completion.choices[0]?.message?.content
		if (!content) {
			throw new Error('No response from OpenAI')
		}

		// Parse the response into structured format
		const lines = content.split('\n')
		const summary: Partial<AlignmentSummary> = {}

		let currentSection = ''
		let currentContent = ''

		for (const line of lines) {
			const trimmed = line.trim()

			if (trimmed.includes('**Purpose**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'purpose'
				currentContent = ''
			} else if (trimmed.includes('**Sponsorship**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'sponsorship'
				currentContent = ''
			} else if (trimmed.includes('**Resources**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'resources'
				currentContent = ''
			} else if (trimmed.includes('**Leadership**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'leadership'
				currentContent = ''
			} else if (trimmed.includes('**Deliverables**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'deliverables'
				currentContent = ''
			} else if (trimmed.includes('**Plan**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'plan'
				currentContent = ''
			} else if (trimmed.includes('**Change**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'change'
				currentContent = ''
			} else if (trimmed.includes('**Investment**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'investment'
				currentContent = ''
			} else if (trimmed.includes('**Benefits**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'benefits'
				currentContent = ''
			} else if (trimmed.includes('**Overall Alignment**')) {
				if (currentSection) summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
				currentSection = 'overallAlignment'
				currentContent = ''
			} else if (currentSection && trimmed && !trimmed.startsWith('*') && !trimmed.startsWith('-')) {
				currentContent += trimmed + ' '
			}
		}

		// Add the last section
		if (currentSection) {
			summary[currentSection as keyof AlignmentSummary] = currentContent.trim()
		}

		return summary as AlignmentSummary
	} catch (error) {
		console.error('Error generating OpenAI summary:', error)
		throw new Error('Failed to generate alignment summary')
	}
}
