const exampleKey = "xgv2exQ2JMT3vMFVwTVaXP3M6MGWXw"

export const
  importerPlaceholder = environment => `# Paste your app's ${environment} variables here.\n\n# In KEY=VAL format\nSOME_API_KEY=${exampleKey}\n\n# In YAML format\nSOME_API_KEY: ${exampleKey}\n\n# Or in JSON format\n{\n  "SOME_API_KEY":"${exampleKey}"\n}`