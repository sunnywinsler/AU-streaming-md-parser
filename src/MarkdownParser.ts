class MarkdownParser {
  private container: HTMLElement;
  
 
  private currentState: 'normal' | 'inline_code' | 'code_block';
  private currentElement: HTMLElement | null;
  private buffer: string; // for handling split backticks

  constructor(container: HTMLElement) {
    this.container = container;
    
   
    this.currentState = 'normal';
    this.currentElement = null;
    this.buffer = '';
  }

 
  private createElementForState(state: 'normal' | 'inline_code' | 'code_block'): HTMLElement {
    if (state === 'inline_code') {
      const code = document.createElement('code');
      code.style.backgroundColor = '#f0f0f0';
      code.style.padding = '2px 4px';
      code.style.borderRadius = '3px';
      code.style.fontFamily = 'monospace';
      return code;
    } else if (state === 'code_block') {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.style.backgroundColor = '#e0e0e0';
      code.style.display = 'block';
      code.style.padding = '10px';
      code.style.fontFamily = 'monospace';
      code.style.whiteSpace = 'pre';
      pre.appendChild(code);
      return pre;
    } else {
      
      const span = document.createElement('span');
      return span;
    }
  }

 
  private switchToState(newState: 'normal' | 'inline_code' | 'code_block'): void {
    if (newState === this.currentState && this.currentElement) {
      return; 
    }
    
    this.currentState = newState;
    
    
    const newElement = this.createElementForState(newState);
    
    
    if (newState === 'code_block') {
      this.container.appendChild(newElement);
      this.currentElement = newElement.querySelector('code');
    } else {
      this.container.appendChild(newElement);
      this.currentElement = newElement;
    }
  }

 
  private appendText(text: string): void {
    if (!text) return;
    
   
    if (!this.currentElement) {
      this.switchToState('normal');
    }
    

    if (this.currentElement) {
      this.currentElement.appendChild(document.createTextNode(text));
    }
  }

 
  processChunk(chunk: string): void {
  
    const text = this.buffer + chunk;
    this.buffer = '';
    
    let i = 0;
    let textAccumulator = ''; 
    
    while (i < text.length) {
      const char = text[i];
      
      if (char === '`') {
       
        let backtickCount = 0;
        let j = i;
        while (j < text.length && text[j] === '`') {
          backtickCount++;
          j++;
        }
        
      
        if (j === text.length) {
        
          this.buffer = text.substring(i);
          break;
        }
        
       
        if (textAccumulator) {
          this.appendText(textAccumulator);
          textAccumulator = '';
        }
        
       
        if (backtickCount === 3) {
        
          if (this.currentState === 'code_block') {
            this.switchToState('normal');
          } else {
            this.switchToState('code_block');
          }
          i = j; 
          
        } else if (backtickCount === 1) {
         
          if (this.currentState === 'inline_code') {
           
            this.switchToState('normal');
            i++;
          } else if (this.currentState === 'normal') {
          
            this.switchToState('inline_code');
            i++;
          } else {
           
            textAccumulator += '`';
            i++;
          }
          
        } else {
         
          textAccumulator += '`'.repeat(backtickCount);
          i = j;
        }
        
      } else {
      
        textAccumulator += char;
        i++;
      }
    }
    
  
    if (textAccumulator) {
      this.appendText(textAccumulator);
    }
  }
}


(window as any).MarkdownParser = MarkdownParser;