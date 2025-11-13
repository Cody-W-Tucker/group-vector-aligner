'use server'

import { createClient } from '@/lib/supabase/server'
import { generateGroupAlignmentSummary } from '@/lib/openai'
import { InterviewRow } from '@/lib/interview'

export async function generateAlignmentSummary(interviews: InterviewRow[], groupId: string) {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) throw new Error('Not authenticated')

	const { data: membership } = await supabase
		.from('group_members')
		.select('role')
		.eq('group_id', groupId)
		.eq('user_id', user.id)
		.single()

	if (!membership || membership.role !== 'admin') throw new Error('Only admins can generate analysis')

	const summary = await generateGroupAlignmentSummary(interviews.map(i => ({ user_id: i.user_id, responses: i.responses, completed_at: i.completed_at })), groupId)

 	// Save to dashboard_summaries for history
 	try {
 		const { error } = await supabase
 			.from('dashboard_summaries')
 			.insert({
 				group_id: groupId,
 				user_id: user.id,
 				section: 'full_summary',
 				summary_content: JSON.stringify(summary),
 				source_responses: interviews,
 			})
		if (error) {
			console.error('Error saving to dashboard_summaries:', error)
			// Continue anyway - don't fail the whole operation
		} else {
			/* console.log('Successfully saved to dashboard_summaries') */
		}
	} catch (error) {
		console.error('Exception saving to dashboard_summaries:', error)
	}

	// Mark interviews as reconciled
	const interviewIds = interviews.map(i => i.id)
	if (interviewIds.length > 0) {
		await supabase
			.from('interview_responses')
			.update({ status: 'reconciled' })
			.in('id', interviewIds)
	}

	// Update groups table with latest summary
	await supabase
		.from('groups')
		.update({ alignment_summary: summary, last_analyzed_at: new Date().toISOString() })
		.eq('id', groupId)

	return summary
}
