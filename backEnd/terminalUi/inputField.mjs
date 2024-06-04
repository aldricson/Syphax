// inputField.mjs

export async function inputField(terminal, prompt, options = {}) {
    terminal(prompt);
    const input = await terminal.inputField(options).promise;
    terminal('\n');
    return input;
}
