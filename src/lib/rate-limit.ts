type RateLimitData = {
	count: number;
	resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitData>();

export type RateLimitResult = {
	success: boolean;
	remaining: number;
	reset: number;
};

export async function rateLimit(
	userId: string,
	action: string,
	limit: number,
	window: number
): Promise<RateLimitResult> {
	const key = `${userId}:${action}`;
	const now = Date.now();

	// Get existing rate limit data
	const existingData = rateLimitStore.get(key);

	// If no data exists or the window has expired, create new data
	if (!existingData || existingData.resetTime <= now) {
		rateLimitStore.set(key, {
			count: 1,
			resetTime: now + window * 1000, // Convert seconds to milliseconds
		});
		return {
			success: true,
			remaining: limit - 1,
			reset: window,
		};
	}

	// If we've hit the limit, return false
	if (existingData.count >= limit) {
		return {
			success: false,
			remaining: 0,
			reset: Math.ceil((existingData.resetTime - now) / 1000), // Convert back to seconds
		};
	}

	// Increment the count
	existingData.count += 1;

	return {
		success: true,
		remaining: limit - existingData.count,
		reset: Math.ceil((existingData.resetTime - now) / 1000), // Convert back to seconds
	};
}
