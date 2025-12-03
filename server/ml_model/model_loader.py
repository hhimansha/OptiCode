#!/usr/bin/env python3
# server/ml_model/model_loader.py

import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os

class CodeRefactorModel:
    def __init__(self, model_path):
        """Initialize the model and tokenizer"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}", file=sys.stderr)
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()
            print("Model loaded successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {str(e)}", file=sys.stderr)
            raise
    
    def refactor_code(self, instruction, input_code, max_length=512, num_beams=5):
        """Refactor code using the trained model"""
        try:
            # Combine instruction and code
            full_input = f"{instruction}\n\nCode:\n{input_code}"
            
            # Tokenize input
            inputs = self.tokenizer(
                full_input,
                return_tensors="pt",
                max_length=max_length,
                truncation=True
            )
            
            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate output
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    num_beams=num_beams,
                    early_stopping=True,
                    temperature=0.7,
                    do_sample=False
                )
            
            # Decode output
            refactored_code = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return refactored_code
        
        except Exception as e:
            print(f"Error during refactoring: {str(e)}", file=sys.stderr)
            raise

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        instruction = input_data.get('instruction', 'Refactor this code')
        input_code = input_data.get('input_code', '')
        model_path = input_data.get('model_path', './final-code-refactor-model')
        
        if not input_code:
            raise ValueError("No input code provided")
        
        # Initialize model
        model = CodeRefactorModel(model_path)
        
        # Refactor code
        refactored_code = model.refactor_code(instruction, input_code)
        
        # Return result
        result = {
            'success': True,
            'refactored_code': refactored_code
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()