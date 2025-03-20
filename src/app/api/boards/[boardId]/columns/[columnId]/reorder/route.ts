// src/app/api/boards/[boardId]/columns/[columnId]/reorder/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { createClient } from '@/lib/supabase';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	const params = await props.params;
	const { columnId } = params;
	const { targetColumnId } = await req.json();

	try {
		// Fetch both the dragged and target columns
		const [{ data: draggedColumn }, { data: targetColumn }] =
			await Promise.all([
				supabase
					.from('columns')
					.select('*')
					.eq('id', columnId)
					.single(),
				supabase
					.from('columns')
					.select('*')
					.eq('id', targetColumnId)
					.single(),
			]);

		// Validate existence
		if (!draggedColumn || !targetColumn) {
			return NextResponse.json(
				{ error: 'One or both columns not found.' },
				{ status: 404 }
			);
		}

		// Swap orders between dragged and target columns
		const { error: updateError } = await supabase.rpc(
			'swap_column_orders',
			{
				column_id_1: draggedColumn.id,
				column_id_2: targetColumn.id,
				order_1: targetColumn.order,
				order_2: draggedColumn.order,
			}
		);

		if (updateError) {
			throw updateError;
		}

		return NextResponse.json({
			message: 'Columns reordered successfully.',
		});
	} catch (error) {
		console.error('Column Reorder Error:', error);
		return NextResponse.json(
			{ error: 'Failed to reorder columns.' },
			{ status: 500 }
		);
	}
}
