import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

let speechRecognizer: sdk.SpeechRecognizer | null = null;
let speechSynthesizer: sdk.SpeechSynthesizer | null = null;
let currentSynthesisPromiseReject: ((reason?: any) => void) | null = null;

export function initializeSpeechServices() {
  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION || 'westeurope';

  if (!speechKey) {
    console.error('Azure Speech key not configured');
    return false;
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  
  // Set language to English (UK) for European audience
  speechConfig.speechRecognitionLanguage = 'en-GB';
  
  // Use a natural sounding voice
  speechConfig.speechSynthesisVoiceName = 'en-GB-SoniaNeural';
  
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  
  const audioConfigOutput = sdk.AudioConfig.fromDefaultSpeakerOutput();
  speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfigOutput);

  return true;
}

export function startContinuousRecognition(
  onRecognizing: (text: string) => void,
  onRecognized: (text: string) => void,
  onError: (error: string) => void
): () => void {
  if (!speechRecognizer) {
    const initialized = initializeSpeechServices();
    if (!initialized) {
      onError('Speech services not initialized');
      return () => {};
    }
  }

  if (!speechRecognizer) {
    onError('Failed to create speech recognizer');
    return () => {};
  }

  speechRecognizer.recognizing = (s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
      onRecognizing(e.result.text);
    }
  };

  speechRecognizer.recognized = (s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
      onRecognized(e.result.text);
    } else if (e.result.reason === sdk.ResultReason.NoMatch) {
      console.log('No speech could be recognized');
    }
  };

  speechRecognizer.canceled = (s, e) => {
    console.log(`Recognition canceled: ${e.reason}`);
    if (e.reason === sdk.CancellationReason.Error) {
      onError(`Error: ${e.errorDetails}`);
    }
    speechRecognizer?.stopContinuousRecognitionAsync();
  };

  speechRecognizer.sessionStopped = (s, e) => {
    console.log('Recognition session stopped');
    speechRecognizer?.stopContinuousRecognitionAsync();
  };

  speechRecognizer.startContinuousRecognitionAsync(
    () => {
      console.log('Recognition started');
    },
    (error) => {
      onError(`Failed to start recognition: ${error}`);
    }
  );

  // Return cleanup function
  return () => {
    speechRecognizer?.stopContinuousRecognitionAsync();
  };
}

export function stopRecognition() {
  if (speechRecognizer) {
    speechRecognizer.stopContinuousRecognitionAsync();
  }
}

export async function speakText(text: string): Promise<void> {
  if (!speechSynthesizer) {
    const initialized = initializeSpeechServices();
    if (!initialized) {
      throw new Error('Speech services not initialized');
    }
  }

  if (!speechSynthesizer) {
    throw new Error('Speech synthesizer not available');
  }

  return new Promise((resolve, reject) => {
    currentSynthesisPromiseReject = reject;
    
    speechSynthesizer!.speakTextAsync(
      text,
      (result) => {
        currentSynthesisPromiseReject = null;
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve();
        } else if (result.reason === sdk.ResultReason.Canceled) {
          // Speech was stopped by user
          resolve();
        } else {
          reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
        }
      },
      (error) => {
        currentSynthesisPromiseReject = null;
        reject(new Error(`Speech synthesis error: ${error}`));
      }
    );
  });
}

export function stopSpeaking() {
  // Reject the current promise to immediately stop waiting
  if (currentSynthesisPromiseReject) {
    currentSynthesisPromiseReject(new Error('Speech interrupted by user'));
    currentSynthesisPromiseReject = null;
  }
  
  if (speechSynthesizer) {
    try {
      // Force close to immediately stop audio playback
      speechSynthesizer.close();
      speechSynthesizer = null;
      
      // Reinitialize for next use
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION || 'westeurope';
      
      if (speechKey) {
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisVoiceName = 'en-GB-SoniaNeural';
        const audioConfigOutput = sdk.AudioConfig.fromDefaultSpeakerOutput();
        speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfigOutput);
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
      // Force null even on error
      speechSynthesizer = null;
    }
  }
}

export function cleanup() {
  if (speechRecognizer) {
    speechRecognizer.close();
    speechRecognizer = null;
  }
  if (speechSynthesizer) {
    speechSynthesizer.close();
    speechSynthesizer = null;
  }
}
