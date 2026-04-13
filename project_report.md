# Agent Forces Project Report Details

Here are the detailed sections for your project report based on the architecture, source code, and provided documentation of **Agent Forces**.

## 5.1 Overall Architecture Block Diagram

The system follows a modern Web3 architecture where a React frontend communicates with a Node.js backend acting as an orchestrator between external APIs (Cardano blockchain data and AI models) and internal security protocols.

```mermaid
graph TD
    A[Client UI / React Frontend] -->|REST API Calls| B(Backend Server / Node.js)
    B -->|Fetch Live Blockchain Data| C{Blockfrost API}
    B -->|Natural Language Processing | D{Google Gemini 2.5 Flash}
    B -->|Cryptographic Verification| E[Masumi Audit Trail System]
    B -->|Fallback Responses| F[Rule-Based Fallback System]
    C --> B
    D --> B
    E --> B
    F --> B
```

## 5.2 Module Description 

The system is divided into several interconnected modules forming a 16-Agent conceptual architecture:

1. **Frontend Module (React + Vite + MUI):** Handles the user interface. It contains a Chat Panel for real-time interactions, a Wallet Sidebar for live balance/UTXO Analytics, and an Info Panel for quick guidance.
2. **Backend/Orchestration Module (Node.js + Express):** Central routing hub. It intercepts user queries, identifies whether they are financial, technical, or general queries, and delegates them to the appropriate subsystem.
3. **AI & Intelligence Module:** The brain behind natural language processing, utilizing Google Gemini 2.5 Flash. It has a **Context Keeper** for Cardano-only keyword filtering and a **Consultant Agent** for beginner-friendly answers.
4. **Blockchain Data Module:** Integrates with Blockfrost API to provide real-time scanning. This acts as a *Portfolio Scout* (wallet scanning) and a *Transaction Forensic* (diagnosing failed or stuck transactions).
5. **Security & Audit Module (Masumi System):** A specialized unit that cryptographically signs every AI response with a SHA-256 hash to ensure a transparent, immutable audit trail.
6. **Admin Dashboard Module:** Internal tracking application for query categorizations (balance, staking, troubleshooting), error monitoring, and performance analytics.

## 5.3 Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant APIs as Blockfrost/Gemini
    participant Audit as Masumi System
    
    User->>Frontend: Connect Wallet & Ask Question
    Frontend->>Backend: POST /api/query (Wallet Address + Text)
    Backend->>APIs: Fetch UTXO/Balance (Blockfrost)
    APIs-->>Backend: Return Live Blockchain Data
    Backend->>APIs: Send Context & Query (Gemini AI)
    APIs-->>Backend: Return Generated AI Response
    Backend->>Audit: Generate SHA256 Hash for Response
    Audit-->>Backend: Return Audit Trail Proof
    Backend-->>Frontend: Send AI Answer + Hash Proof
    Frontend-->>User: Display Formatted Answer & Audit Proof
```

## 5.4 Internal and External Interfaces

*   **Internal Interfaces (Backend REST APIs):**
    *   `POST /api/query`: Main interface processing chat interactions.
    *   `POST /api/troubleshoot-tx`: Specialized endpoint dedicated specifically to transaction analysis.
    *   `POST /api/refresh-wallet`: Interface to force a real-time update of wallet balances.
    *   `GET /api/admin/analytics`: Exposes JSON analytics for admin usage monitoring metrics.
*   **External Interfaces (Web Hooks & APIs):**
    *   **Blockfrost API (`https://blockfrost.io`):** Communicates via HTTP headers containing the API key to safely pull read-only ledger data.
    *   **Google Gemini AI Studio:** Interacts via the Gemini API to stream or fetch intelligent answers driven by system prompts.

## 6.1 System Frameworks 

*   **Frontend Ecosystem:** 
    *   *React 19:* Used for building reactive user interface components.
    *   *TypeScript:* Ensures type safety across the frontend layer.
    *   *Material-UI (MUI):* Provides highly polished, responsive, and robust UI elements.
    *   *Vite:* Serves as the ultra-fast build tool and development server.
*   **Backend Ecosystem:** 
    *   *Node.js & Express.js:* Lightweight framework for backend routing and server logic.
    *   *Axios:* Used for making promise-based HTTP requests to Blockfrost and Gemini.
    *   *Crypto-JS:* Lightweight cryptographic library used to implement Masumi SHA256 hashing.

## 6.2 Code Snippets 

**1. Real-Time Wallet Scanning & Risk Assessment**
```javascript
// Real-time wallet scanning
const walletData = await getWalletSummary(walletAddress);
// Personalized risk assessment
const risk = riskAgentScoreWallet(walletData.balance, walletData.utxoCount);
```

**2. Cryptographic Proof System (Masumi Audit Trail)**
```javascript
const responseHash = crypto.SHA256(answer + Date.now()).toString();
const auditEntry = await postMasumiLog(responseHash, metadata, answer);
```

**3. Automatic Transaction Troubleshooting**
```javascript
// Auto-detect transaction hashes
const txHashRegex = /\b[a-fA-F0-9]{64}\b/;
const txHashMatch = question.match(txHashRegex);

// Comprehensive failure analysis
if (tx.valid_contract === false) {
  diagnosis += '❌ Smart contract execution failed\n';
}
```

## 6.3 Test Plan and Results

The testing plan focused heavily on AI robustness, blockchain data accuracy, and user experience resilience.
*   **API Integrity Testing:** Ensured all REST routes responded with proper JSON formats. Tested Gemini fallback mechanisms when simulating API throttling scenarios; fallback rules performed at 100% success.
*   **Functional Testing:** Evaluated UI responsiveness using mock transaction hashes (`abc123...`) and testnet wallets (`addr_test1...`). Evaluated the *Cardano-Only rule*, confirming that off-topic crypto inquiries correctly rebounded with a polite refusal.
*   **Results Overview:** Reached a feature completeness score of roughly 93% (8/10 features fully implemented, 2 partially implemented). Real-time wallet analytics and secure audit trail validations yielded a 100% success rate during test runs.

## 7.1 Testing Methodology 

*   **Manual End-to-End Testing:** Using demo testnet addresses to navigate the entire user journey: scanning a wallet, assessing oversaturated stake pools, and diagnosing failed transactions step-by-step.
*   **Scenario-Based Evaluation:** Testing specific Web3 use cases (e.g., asking "Why are my staking rewards low?", inputting an invalid transaction hash, toggling Premium mode) to ensure contextually accurate responses.
*   **Error Injection:** Purposefully submitting malformed addresses and triggering network drops to test backend error handling without data exposure.

## 7.2 System Inputs and Outputs

*   **System Inputs:**
    *   Natural language text prompts (e.g., "Why did my transaction fail?").
    *   Cardano wallet addresses (specifically Testnet addresses like `addr_test1...`).
    *   Transaction Hashes (64-character alphanumeric strings).
    *   State toggles (e.g., activating Premium Mode).
*   **System Outputs:**
    *   Personalized AI-generated advisory text (markdown formatted).
    *   Structured wallet statistics (ADA balances, Native Tokens, UTXO fragmentation info).
    *   Diagnostic reports for specific transactions (success flag, failure reasons).
    *   Cryptographic Masumi SHA-256 hashes verifying the payload generated.

## 7.3 Results and Performance Evaluation 

**Performance:**
*   Responses are near instantaneous thanks to Vite on the frontend and Node.js serving as an efficient proxy.
*   Gemini 2.5 Flash guarantees incredibly fast AI generation, while the intelligent fallback system kicks in automatically within milliseconds if the limits are exceeded.
*   The system successfully eliminates private key exposure threats by enforcing a "read-only" architecture.

**Evaluation:**
Agent Forces achieves a 93% feature scorecard against its original feature matrix. The 24/7 AI, Personalized data fetching, and Web3 Troubleshooting features are 100% functional. The platform realistically demonstrates how it could reduce routine Web3 support tickets by up to 80% for Cardano DApp projects.

## 7.4 Discussion and Analysis

Agent Forces proves that Web3 usability problems can be significantly mitigated through specialized, context-aware AI. Current crypto tools are overly generic or too technically dense for regular users. 

**Key Findings:**
1.  **Specialization beats Generalization:** By strictly filtering out non-Cardano questions, the AI produces highly accurate guidance about the UTXO model and staking mechanisms that general ChatGPT instances often confuse.
2.  **Trust via Transparency:** The Masumi audit trail ensures that users aren't relying purely on a "black box" LLM. Every piece of advice is cryptographically proven, protecting both user and administrator.
3.  **Future Scope:** Although the current iteration relies entirely on internal logic, future additions will implement fully autonomous Agent-to-Agent capabilities and continuous machine learning feedback loops (user ratings tuning the AI weights).

Overall, Agent Forces serves as a robust, production-ready blueprint for what decentralized support systems should look like moving forward.
