import { PrismaClient, BoardVisibility } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

type ModelName = keyof typeof prisma;

// Sample data generators for each model
const sampleData: Record<string, (...args: any[]) => any> = {
	Team: () => ({
		name: faker.company.name(),
		description: faker.company.catchPhrase(),
	}),

	Changelog: () => ({
		version: faker.system.semver(),
		date: faker.date.past(),
		features: JSON.stringify([
			faker.git.commitMessage(),
			faker.git.commitMessage(),
		]),
		fixes: JSON.stringify([faker.git.commitMessage()]),
		improvements: JSON.stringify([faker.git.commitMessage()]),
	}),

	ContactSubmission: () => ({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		message: faker.lorem.paragraph(),
	}),

	Project: (teamId: string) => ({
		name: faker.company.name(),
		description: faker.company.catchPhrase(),
		teamId,
	}),

	Board: (projectId: string) => ({
		name: faker.word.words(3),
		visibility: faker.helpers.arrayElement(Object.values(BoardVisibility)),
		backgroundColor: faker.internet.color(),
		textColor: faker.internet.color(),
		gradient: `linear-gradient(${faker.internet.color()}, ${faker.internet.color()})`,
		projectId,
	}),

	Column: (boardId: string) => ({
		title: faker.word.words(2),
		order: faker.number.int({ min: 0, max: 5 }),
		backgroundColor: faker.internet.color(),
		backgroundGradient: `linear-gradient(${faker.internet.color()}, ${faker.internet.color()})`,
		backgroundImage: faker.image.url(),
		boardId,
	}),

	BoardTaskPriority: (boardId: string) => ({
		name: faker.helpers.arrayElement(['High', 'Medium', 'Low', 'Urgent']),
		order: faker.number.int({ min: 0, max: 3 }),
		boardId,
	}),

	Task: (columnId: string, priorityId: string) => ({
		title: faker.lorem.sentence(),
		description: faker.lorem.paragraph(),
		dueDate: faker.date.future(),
		order: faker.number.int({ min: 0, max: 10 }),
		coverColor: faker.internet.color(),
		coverGradient: `linear-gradient(${faker.internet.color()}, ${faker.internet.color()})`,
		coverImage: faker.image.url(),
		columnId,
		priorityId,
	}),

	Checklist: (taskId: string) => ({
		name: faker.helpers.arrayElement([
			'To Do',
			'In Progress',
			'Done',
			'Review',
		]),
		taskId,
	}),

	ChecklistItem: (checklistId: string) => ({
		text: faker.lorem.sentence(),
		completed: faker.datatype.boolean(),
		checklistId,
	}),

	Label: (boardId: string) => ({
		name: faker.word.words(2),
		backgroundColor: faker.internet.color(),
		boardId,
	}),

	Comment: (taskId: string, authorId: string) => ({
		content: faker.lorem.paragraph(),
		taskId,
		authorId,
	}),

	TaskHistory: (taskId: string, boardId: string, authorId: string) => ({
		change: faker.git.commitMessage(),
		taskId,
		boardId,
		authorId,
	}),

	FileAttachment: (taskId: string, uploadedById: string) => ({
		fileUrl: faker.image.url(),
		fileName: faker.system.fileName(),
		fileType: faker.helpers.arrayElement([
			'image/jpeg',
			'image/png',
			'application/pdf',
		]),
		fileSize: faker.number.int({ min: 1000, max: 1000000 }),
		taskId,
		uploadedById,
	}),

	Integration: (teamId: string) => ({
		provider: faker.helpers.arrayElement([
			'GITHUB',
			'GOOGLE_DOCS',
			'DISCORD',
		]),
		config: JSON.stringify({
			apiKey: faker.string.uuid(),
			settings: faker.helpers.multiple(() => ({
				key: faker.word.sample(),
				value: faker.word.sample(),
			})),
		}),
		teamId,
	}),

	TeamRole: (teamId: string) => ({
		name: faker.helpers.arrayElement([
			'Admin',
			'Editor',
			'Viewer',
			'Contributor',
		]),
		permissions: JSON.stringify({
			canEdit: faker.datatype.boolean(),
			canDelete: faker.datatype.boolean(),
			canInvite: faker.datatype.boolean(),
		}),
		teamId,
		canDelete: faker.datatype.boolean(),
	}),

	Invite: (teamId: string) => ({
		email: faker.internet.email(),
		token: faker.string.uuid(),
		role: faker.helpers.arrayElement(['Admin', 'Editor', 'Viewer']),
		status: faker.helpers.arrayElement(['pending', 'accepted', 'expired']),
		expiresAt: faker.date.future(),
		teamId,
	}),
};

// Function to seed a specific model
async function seedModel(modelName: string, count: number = 1) {
	console.log(`Seeding ${modelName}...`);

	try {
		// Handle special cases for models that require related data
		switch (modelName) {
			case 'Project':
				const teams = await prisma.team.findMany();
				if (teams.length === 0) {
					console.log('No teams found. Please seed teams first.');
					return;
				}
				for (let i = 0; i < count; i++) {
					const team =
						teams[Math.floor(Math.random() * teams.length)];
					await prisma.project.create({
						data: sampleData.Project(team.id),
					});
				}
				break;

			case 'Board':
				const projects = await prisma.project.findMany();
				if (projects.length === 0) {
					console.log(
						'No projects found. Please seed projects first.'
					);
					return;
				}
				for (let i = 0; i < count; i++) {
					const project =
						projects[Math.floor(Math.random() * projects.length)];
					await prisma.board.create({
						data: sampleData.Board(project.id),
					});
				}
				break;

			case 'Column':
				const boards = await prisma.board.findMany();
				if (boards.length === 0) {
					console.log('No boards found. Please seed boards first.');
					return;
				}
				for (let i = 0; i < count; i++) {
					const board =
						boards[Math.floor(Math.random() * boards.length)];
					await prisma.column.create({
						data: sampleData.Column(board.id),
					});
				}
				break;

			case 'Task':
				const columns = await prisma.column.findMany();
				const priorities = await prisma.boardTaskPriority.findMany();
				if (columns.length === 0 || priorities.length === 0) {
					console.log(
						'No columns or priorities found. Please seed them first.'
					);
					return;
				}
				for (let i = 0; i < count; i++) {
					const column =
						columns[Math.floor(Math.random() * columns.length)];
					const priority =
						priorities[
							Math.floor(Math.random() * priorities.length)
						];
					await prisma.task.create({
						data: sampleData.Task(column.id, priority.id),
					});
				}
				break;

			default:
				// For models without special requirements
				const model = modelName.toLowerCase() as ModelName;
				const createMethod = (prisma[model] as any).create;
				if (typeof createMethod === 'function') {
					for (let i = 0; i < count; i++) {
						await createMethod.call(prisma[model], {
							data: sampleData[modelName](),
						});
					}
				} else {
					console.error(
						`No create method found for model ${modelName}`
					);
				}
		}

		console.log(`Successfully seeded ${count} ${modelName} records`);
	} catch (error) {
		console.error(`Error seeding ${modelName}:`, error);
	}
}

// Main seeding function
async function seed(
	tables: string[] = [],
	counts: Record<string, number> = {}
) {
	try {
		// Only seed specified tables
		const tablesToSeed = tables.length > 0 ? tables : [];

		for (const table of tablesToSeed) {
			const count = counts[table] || 1;
			await seedModel(table, count);
		}

		console.log('Seeding completed successfully');
	} catch (error) {
		console.error('Error during seeding:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Parse command line arguments
const args = process.argv.slice(2);
const tables: string[] = [];
const counts: Record<string, number> = {};

for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	if (arg.startsWith('--')) {
		const table = arg.slice(2);
		const nextArg = args[i + 1];
		if (nextArg && !isNaN(Number(nextArg))) {
			counts[table] = Number(nextArg);
			i++; // Skip the next argument
		} else {
			tables.push(table);
		}
	}
}

// Run the seeding
seed(tables, counts);
