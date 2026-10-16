import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

export function readFileTool(
	filePath: string,
): { status: string; content?: string; message?: string } {
	try {
		const content = readFileSync(filePath, 'utf-8');
		return { status: 'success', content };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return { status: 'error', message };
	}
}

export function searchSymbolsTool(
	directory: string,
	symbolName: string,
): { status: string; matches: Array<{ filePath: string; lineNumber: number }> } {
	try {
		const matches: Array<{ filePath: string; lineNumber: number }> = [];

		const searchDirectory = (currentDirectory: string): void => {
			for (const entry of readdirSync(currentDirectory)) {
				const filePath = join(currentDirectory, entry);
				if (statSync(filePath).isDirectory()) {
					searchDirectory(filePath);
					continue;
				}

				if (!filePath.endsWith('.ts')) {
					continue;
				}

				const lines = readFileSync(filePath, 'utf-8').split(/\r?\n/);
				lines.forEach((line, index) => {
					if (line.includes(symbolName)) {
						matches.push({ filePath, lineNumber: index + 1 });
					}
				});
			}
		};

		searchDirectory(directory);
		return { status: 'success', matches };
	} catch {
		return { status: 'error', matches: [] };
	}
}

export function runTestsTool(
	testType: 'sandbox' | 'typescript',
): { exitCode: number; stdout: string; stderr: string } {
	const COMMANDS: Record<string, string> = {
		sandbox: 'node --test sandbox/test/addNumbers.test.js',
		typescript: 'npx tsc --noEmit',
	};

	const command = COMMANDS[testType];
	if (!command) {
		return { exitCode: 1, stdout: '', stderr: `Unknown test type: ${testType}` };
	}

	try {
		const stdout = execSync(command, {
			cwd: process.cwd(),
			timeout: 30000,
			maxBuffer: 1024 * 1024,
			stdio: 'pipe',
		}).toString();

		return { exitCode: 0, stdout, stderr: '' };
	} catch (error: unknown) {
		const commandError = error as {
			status?: number;
			stdout?: string | Buffer;
			stderr?: string | Buffer;
		};

		return {
			exitCode: commandError.status ?? 1,
			stdout: commandError.stdout?.toString() ?? '',
			stderr: commandError.stderr?.toString() ?? String(error),
		};
	}
}

export function applyPatchTool(
	filePath: string,
	originalContent: string,
	newContent: string,
): { status: string; filePath?: string; message?: string } {
	try {
		const currentContent = readFileSync(filePath, 'utf-8');
		if (!currentContent.includes(originalContent)) {
			return {
				status: 'not_found',
				message: 'Original content was not found in the file.',
			};
		}

		writeFileSync(filePath, currentContent.replace(originalContent, newContent), 'utf-8');
		return { status: 'applied', filePath };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return { status: 'not_found', message };
	}
}
