export const ASK_NEDI_DESCRIPTION =
  "Ask Nedi, Netdata's AI assistant, questions about Netdata documentation, configuration, monitoring, and troubleshooting.";

const ASK_NEDI_PERMALINK = '/docs/ask-nedi';

export function resolveDocDescription({description, permalink}) {
  return permalink === ASK_NEDI_PERMALINK ? ASK_NEDI_DESCRIPTION : description;
}
