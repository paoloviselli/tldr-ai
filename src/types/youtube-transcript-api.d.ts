declare module 'youtube-transcript-api' {
  interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
  }

  export function youtubeTranscript(
    videoId: string
  ): Promise<TranscriptResponse[]>;
}
