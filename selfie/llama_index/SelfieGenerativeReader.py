from typing import List, Optional
from datetime import datetime

from llama_index.core.schema import Document

from selfie.embeddings import DataIndex


class SelfieGenerativeReader:
    """Selfie Generative report reader.

    Generates reports based on a range of documents using a specified prompt.

    Args:
        target_data_source (str): Identifier for the target data source.
        prompt (str): Prompt used for generating the report.
        earliest_date (Optional[datetime]): Earliest date from which to accumulate data.
        latest_date (Optional[datetime]): Latest date until which to accumulate data.
        strategy (str): Strategy used for data accumulation, e.g., 'accumulate_over'.
    """

    def __init__(
        self,
        target_data_source: str,
        prompt: str,
        strategy: str = "accumulate_over",
    ) -> None:
        self.target_data_source = target_data_source
        # self.earliest_date = earliest_date
        # self.latest_date = latest_date
        self.prompt = prompt
        self.strategy = strategy
        self.data_index = DataIndex()

    async def load_data(
        self,
        document_ids: List[str],
        earliest_date: Optional[datetime] = None,
        # latest_date: Optional[datetime] = None
    ) -> List[Document]:
        """Generates a report based on the provided document IDs and prompt.

        Args:
            document_ids (List[str]): List of document IDs to include in the report.
            earliest_date (Optional[datetime]): Only process data created after this date.

        Returns:
            Document: The generated report as a Document object.
        """
        report_content = await self.data_index.accumulate_over(
            self.prompt,
            source_document_ids=[int(document_id) for document_id in document_ids],
            **({"earliest_date": earliest_date} if earliest_date else {}),
            # earliest_date=self.earliest_date,
            # latest_date=self.latest_date
        )

        # Create a Document object for the generated report
        # The ID and metadata can be adjusted based on your requirements
        return [
            Document(
                id_="generated_report_" + datetime.now().strftime("%Y%m%d%H%M%S"),
                text=report_content,
                metadata={
                    "prompt": self.prompt,
                    "strategy": self.strategy,
                    "document_ids": document_ids,
                    "generated_on": datetime.now().isoformat(),
                },
            )
        ]


# Example usage
# Note: This requires an async context, e.g., within an async function or an event loop
# selfie_generative_reader = SelfieGenerativeReader(...)
# report_document = await selfie_generative_reader.load_data([...])
