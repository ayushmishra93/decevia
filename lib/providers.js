export function configuredProviders(){return [...(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?['google']:[]),...(process.env.GITHUB_ID&&process.env.GITHUB_SECRET?['github']:[])];}
