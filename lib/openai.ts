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

	const jsonSchema = {
		type: 'object',
		properties: {
			purpose: { type: 'string' },
			sponsorship: { type: 'string' },
			resources: { type: 'string' },
			leadership: { type: 'string' },
			deliverables: { type: 'string' },
			plan: { type: 'string' },
			change: { type: 'string' },
			investment: { type: 'string' },
			benefits: { type: 'string' },
			overallAlignment: { type: 'string' },
		},
		required: ['purpose', 'sponsorship', 'resources', 'leadership', 'deliverables', 'plan', 'change', 'investment', 'benefits', 'overallAlignment'],
		additionalProperties: false,
	}

 	const prompt = `
You are an expert facilitator synthesizing group alignment insights from ${interviews.length} contributors.

${previousContext}Based on the ${previousSummary ? 'previous analysis and ' : ''}following new interview responses, create an updated unified alignment summary that captures the collective vision, commitments, and action plan. ${previousSummary ? 'Integrate the new insights with the previous analysis, maintaining continuity while updating where new information changes the understanding.' : ''}

${interviewSummaries}

Please provide a structured summary with these sections, each containing concise (2-4 sentences) but comprehensive content:

- Purpose: Unified vision/mission statement
- Sponsorship: Collective sponsorship commitments
- Resources: Available and needed resources
- Leadership: Leadership structure and commitments
- Deliverables: Key outputs and milestones
- Plan: High-level action plan
- Change: Change management approach
- Investment: Required investments and funding
- Benefits: Expected value and outcomes
- Overall Alignment: Assessment of group readiness and next steps

Use collaborative language that reflects the group's collective wisdom.`

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
			response_format: {
				type: 'json_schema',
				json_schema: {
					name: 'alignment_summary',
					schema: jsonSchema,
					strict: true,
				},
			},
		})

		const content = completion.choices[0]?.message?.content
		if (!content) {
			throw new Error('No response from OpenAI')
		}

		// Parse the structured JSON response
		const summary = JSON.parse(content) as AlignmentSummary
		return summary
	} catch (error) {
		console.error('Error generating OpenAI summary:', error)
		throw new Error('Failed to generate alignment summary')
	}
}
