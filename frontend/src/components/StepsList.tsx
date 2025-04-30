import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-cursor-sidebar rounded-lg p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-cursor-text">Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentStep === step.id
                ? 'bg-cursor-active border border-cursor-border'
                : 'hover:bg-cursor-hover'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-2">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : step.status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-cursor-accent" />
              ) : (
                <Circle className="w-5 h-5 text-cursor-text/30" />
              )}
              <h3 className="font-medium text-cursor-text">{step.title}</h3>
            </div>
            <p className="text-sm text-cursor-text/70 mt-2">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}