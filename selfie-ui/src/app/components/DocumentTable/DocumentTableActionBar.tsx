import React, { useState } from 'react';

import { Document, DocumentStats } from "@/app/types";

interface IndexDocumentsFormProps {
  onIndexDocuments: () => void | Promise<void>;
  onUnindexDocuments: () => void | Promise<void>;
  onGenerateReport: (name: string, strategy: string, prompt: string) => void | Promise<void>;
  indexableDocuments: Document[];
  unindexableDocuments: Document[];
  hasSelectedDocuments: boolean;
  disabled?: boolean;
  stats?: DocumentStats;
}

enum ReportStrategy {
  ACCUMULATE = "accumulate",
}

const samplePrompt = `Analyze the document fragments to identify and articulate enduring character traits, values, and beliefs of the subjects. Present your findings as a bullet-point list, starting directly with the traits or values, and avoid context-dependent references and introductory statements. Always refer to subjects by their proper nouns, directly naming the individual(s). Avoid the use of pronouns or collective nouns. Your goal is NOT to make a separate list for each subject, but to make one list that includes one or more subjects. Here are some generic examples:\n\n- Incorrect: '* The subject created a group.'\n- Correct: '* John displays leadership and initiative in social settings.'\n\n- Incorrect: '* Expressed excitement for an upcoming social event.'\n- Correct: '* Alice shows a high regard for social bonding and collective experiences.'\n\n- Incorrect: '* Jeremy: Mentioned a preference for planning before an event.'\n- Correct: '* Jeremy values careful planning and personal well-being as a lifestyle approach.'\n\nThe list should only include significant, character-defining details. If no such details are present, simply state 'None' at the end of the list.`

const LabeledInput = ({ label, children }) => {
  return <label className="form-control w-full">
    <div className="label">
      <span className="label-text">{label}</span>
    </div>
    {children}
  </label>
}

export const DocumentTableActionBar: React.FC<IndexDocumentsFormProps> = ({
                                                                        onIndexDocuments,
                                                                        onUnindexDocuments,
                                                                        onGenerateReport,
                                                                        indexableDocuments,
                                                                        unindexableDocuments,
                                                                        hasSelectedDocuments,
                                                                        disabled = false,
                                                                        stats,
                                                                      }) => {
  const [showForm, setShowForm] = useState(false);
  const [reportName, setReportName] = useState('');
  const [strategy, setStrategy] = useState(ReportStrategy.ACCUMULATE);
  const [prompt, setPrompt] = useState(samplePrompt);

  const [report, setReport] = useState('');

  const handleSubmit = async (event: React.FormEvent, isIndex: boolean) => {
    event.preventDefault();
    await (isIndex ? onIndexDocuments() : onUnindexDocuments());
  };

  const handleGenerateReport = async (event: React.FormEvent) => {
    event.preventDefault();
    const { report } = await onGenerateReport(reportName, strategy, prompt);
    setReport(report);
  }

  return (
    <div>
      <div className="flex justify-between">
        <form onSubmit={() => {}} className="flex items-center space-x-4">
          <button
            type="button"
            className="btn btn-sm mr-2"
            disabled={disabled || !hasSelectedDocuments || indexableDocuments.length === 0}
            onClick={(event) => handleSubmit(event, true)}
          >
            Index {indexableDocuments.length}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-error btn-outline"
            disabled={disabled || !hasSelectedDocuments || unindexableDocuments.length === 0}
          onClick={(event) => handleSubmit(event, false)}
        >
          Unindex {unindexableDocuments.length}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={disabled || !hasSelectedDocuments}
          onClick={() => setShowForm(!showForm)}
        >
          Generate Report... ({unindexableDocuments.length})
        </button>
      </form>

      {stats && Object.keys(stats).length && <span className="my-4">
          Total: {stats.totalDocuments} | Indexed: {stats.numDocumentsIndexed} | Indexed Chunks: {stats.numEmbeddingIndexDocuments}
      </span>}
    </div>
      {showForm && (
        <div className="w-full">
          <form className="flex w-full card bg-base-300 p-4 gap-4" onSubmit={handleGenerateReport}>
            <div className="flex flex-row gap-4" style={{minHeight: "450px"}}>
              <div className="">
                <LabeledInput label="Name">
                  <input
                    type="text"
                    placeholder="My Report"
                    className="input input-bordered input-sm w-full"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    required
                  />
                </LabeledInput>

                <LabeledInput label="Strategy">
                  <select
                    id="strategy"
                    name="strategy"
                    className="select select-bordered w-full"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    required
                  >
                    <option value="accumulate">Accumulate Over</option>
                  </select>
                </LabeledInput>
              </div>
              <div className="flex flex-grow">
                <LabeledInput label="Prompt">
                  <textarea
                    id="prompt"
                    className="textarea textarea-bordered h-full w-full text-sm"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  /> </LabeledInput>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-outline btn-secondary"
                      onClick={() => setShowForm(false)}>Cancel
              </button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>

            {report && <h2 className="mt-4">Report</h2> }
            {report && <div className="w-full card bg-base-100 p-4">
                <div className="overflow-auto" style={{maxHeight: "400px"}}>
                  <pre className="text-xs">
                    {report}
                  </pre>
                </div>
            </div>}
          </form>
        </div>
      )}
    </div>
  );
};
