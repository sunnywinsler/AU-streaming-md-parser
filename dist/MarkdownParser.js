"use strict";
class MarkdownParser {
    constructor(container) {
        this.container = container;
        // Initialize state
        this.currentState = 'normal';
        this.currentElement = null;
        this.buffer = '';
    }
    /**
     * Creates the appropriate HTML element for a given state
     */
    createElementForState(state) {
        if (state === 'inline_code') {
            const code = document.createElement('code');
            code.style.backgroundColor = '#f0f0f0';
            code.style.padding = '2px 4px';
            code.style.borderRadius = '3px';
            code.style.fontFamily = 'monospace';
            return code;
        }
        else if (state === 'code_block') {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.style.backgroundColor = '#e0e0e0';
            code.style.display = 'block';
            code.style.padding = '10px';
            code.style.fontFamily = 'monospace';
            code.style.whiteSpace = 'pre';
            pre.appendChild(code);
            return pre;
        }
        else {
            // normal text - use a span
            const span = document.createElement('span');
            return span;
        }
    }
    /**
     * Switches to a new state and creates a new DOM element
     */
    switchToState(newState) {
        if (newState === this.currentState && this.currentElement) {
            return; // already in this state with valid element
        }
        this.currentState = newState;
        // Create new element for the new state
        const newElement = this.createElementForState(newState);
        // For code_block, we append the <pre>, but write text to the <code> inside
        if (newState === 'code_block') {
            this.container.appendChild(newElement);
            this.currentElement = newElement.querySelector('code');
        }
        else {
            this.container.appendChild(newElement);
            this.currentElement = newElement;
        }
    }
    /**
     * Appends text to the current element
     */
    appendText(text) {
        if (!text)
            return;
        // Make sure we have a current element
        if (!this.currentElement) {
            this.switchToState('normal');
        }
        // Append text as a text node
        if (this.currentElement) {
            this.currentElement.appendChild(document.createTextNode(text));
        }
    }
    /**
     * Process a chunk of markdown text as it streams in.
     * This method will be called multiple times with successive chunks.
     *
     * Requirements:
     * 1. Parse inline code (`code`) and code blocks (```code```)
     * 2. Be optimistic - style immediately when you see opening backticks
     * 3. Don't replace the entire DOM - append new elements for user selection
     * 4. Handle backticks split across chunks
     *
     * @param chunk - A piece of markdown text
     */
    processChunk(chunk) {
        // Combine buffer from last chunk with new chunk
        const text = this.buffer + chunk;
        this.buffer = '';
        let i = 0;
        let textAccumulator = ''; // collect text before adding to DOM
        while (i < text.length) {
            const char = text[i];
            if (char === '`') {
                // Count consecutive backticks
                let backtickCount = 0;
                let j = i;
                while (j < text.length && text[j] === '`') {
                    backtickCount++;
                    j++;
                }
                // Check if we're at end of chunk (might be incomplete backticks)
                if (j === text.length) {
                    // Save to buffer and stop processing
                    this.buffer = text.substring(i);
                    break;
                }
                // We have a complete backtick sequence
                // First, output any accumulated text
                if (textAccumulator) {
                    this.appendText(textAccumulator);
                    textAccumulator = '';
                }
                // Handle state transitions based on backtick count
                if (backtickCount === 3) {
                    // Triple backtick - toggle code block
                    if (this.currentState === 'code_block') {
                        this.switchToState('normal');
                    }
                    else {
                        this.switchToState('code_block');
                    }
                    i = j; // skip all backticks
                }
                else if (backtickCount === 1) {
                    // Single backtick
                    if (this.currentState === 'inline_code') {
                        // Close inline code
                        this.switchToState('normal');
                        i++;
                    }
                    else if (this.currentState === 'normal') {
                        // Open inline code
                        this.switchToState('inline_code');
                        i++;
                    }
                    else {
                        // Inside code block - backtick is literal
                        textAccumulator += '`';
                        i++;
                    }
                }
                else {
                    // 2 backticks or 4+ backticks - treat as literal text
                    textAccumulator += '`'.repeat(backtickCount);
                    i = j;
                }
            }
            else {
              
                textAccumulator += char;
                i++;
            }
        }
     
        if (textAccumulator) {
            this.appendText(textAccumulator);
        }
    }
}

window.MarkdownParser = MarkdownParser;
