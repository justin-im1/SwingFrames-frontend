'use client';

import { useActionState, useOptimistic } from 'react';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

// Define the action state type
interface ActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Define the form data type
interface FormData {
  title: string;
  description: string;
  outcome: string;
  club: string;
}

// Mock async action function
async function submitSwingForm(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate validation
  const errors: Record<string, string[]> = {};

  if (!formData.title.trim()) {
    errors.title = ['Title is required'];
  }

  if (!formData.outcome) {
    errors.outcome = ['Outcome is required'];
  }

  if (!formData.club) {
    errors.club = ['Club is required'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  return {
    success: true,
    message: 'Swing saved successfully!',
  };
}

export default function FormAction() {
  const [state, formAction, isPending] = useActionState(submitSwingForm, {
    success: false,
    message: '',
  });

  const [optimisticState, addOptimistic] = useOptimistic(
    { submissions: 0 },
    state => ({
      submissions: state.submissions + 1,
    })
  );

  const handleSubmit = (formData: FormData) => {
    addOptimistic(formData);
    formAction(formData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          React 19 Form with Actions
        </h3>

        <form
          action={formData => {
            const data: FormData = {
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              outcome: formData.get('outcome') as string,
              club: formData.get('club') as string,
            };
            handleSubmit(data);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              name="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter swing title"
            />
            {state.errors?.title && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter swing description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome *
            </label>
            <select
              name="outcome"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select outcome</option>
              <option value="pure">Pure</option>
              <option value="slice">Slice</option>
              <option value="hook">Hook</option>
              <option value="push">Push</option>
              <option value="pull">Pull</option>
            </select>
            {state.errors?.outcome && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.outcome[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club *
            </label>
            <select
              name="club"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select club</option>
              <option value="driver">Driver</option>
              <option value="3-wood">3-Wood</option>
              <option value="5-wood">5-Wood</option>
              <option value="7-iron">7-Iron</option>
              <option value="9-iron">9-Iron</option>
              <option value="pw">Pitching Wedge</option>
            </select>
            {state.errors?.club && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.club[0]}
              </p>
            )}
          </div>

          <Button type="submit" loading={isPending} className="w-full">
            {isPending ? 'Saving...' : 'Save Swing'}
          </Button>
        </form>

        {state.message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              state.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Optimistic submissions: {optimisticState.submissions}
        </div>
      </CardContent>
    </Card>
  );
}
