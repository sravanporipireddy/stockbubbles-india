import { toast } from "sonner";

// Types for Breeze API
export interface BreezeCredentials {
  apiKey: string;
  secretKey: string;
  sessionToken?: string;
  userId?: string;
}

export interface BreezeSession {
  sessionToken: string;
  userId: string;
  isAuthenticated: boolean;
}

// Stock and market data interfaces
export interface BreezeStockQuote {
  exchange: string;
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
}

export interface BreezeMarketData {
  indices: {
    name: string;
    value: number;
    changePercent: number;
  }[];
  sectors: {
    name: string;
    changePercent: number;
    marketCap: number;
  }[];
  stocks: any[];
}

class BreezeApiClient {
  private baseUrl = "https://api.icicidirect.com/apimarket/";
  private apiKey: string = "";
  private secretKey: string = "";
  private sessionToken: string = "";
  private userId: string = "";
  private isAuthenticated: boolean = false;
  
  constructor() {
    // Try to load credentials from localStorage
    this.loadCredentialsFromStorage();
  }
  
  private loadCredentialsFromStorage() {
    try {
      const storedCredentials = localStorage.getItem('breezeCredentials');
      if (storedCredentials) {
        const credentials = JSON.parse(storedCredentials) as BreezeCredentials;
        this.apiKey = credentials.apiKey || "";
        this.secretKey = credentials.secretKey || "";
        this.sessionToken = credentials.sessionToken || "";
        this.userId = credentials.userId || "";
        this.isAuthenticated = !!(this.sessionToken && this.userId);
      }
    } catch (error) {
      console.error("Failed to load Breeze credentials from storage:", error);
    }
  }
  
  private saveCredentialsToStorage() {
    try {
      localStorage.setItem('breezeCredentials', JSON.stringify({
        apiKey: this.apiKey,
        secretKey: this.secretKey,
        sessionToken: this.sessionToken,
        userId: this.userId
      }));
    } catch (error) {
      console.error("Failed to save Breeze credentials to storage:", error);
    }
  }
  
  public getSession(): BreezeSession {
    return {
      sessionToken: this.sessionToken,
      userId: this.userId,
      isAuthenticated: this.isAuthenticated
    };
  }
  
  public logout() {
    this.sessionToken = "";
    this.userId = "";
    this.isAuthenticated = false;
    // Keep API key and secret for easier re-login
    this.saveCredentialsToStorage();
    return true;
  }
  
  // Based on the reference implementation
  public async login(apiKey: string, secretKey: string): Promise<boolean> {
    if (!apiKey || !secretKey) {
      toast.error("API Key and Secret Key are required");
      return false;
    }
    
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    
    try {
      // This is a simplified version - in a real implementation, we would use
      // the actual Breeze API endpoints to authenticate
      // Based on the reference repo: https://github.com/kaustubh2024/Algo_Trading_Using_Breeze_API
      
      const response = await fetch(`${this.baseUrl}customerlogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": this.apiKey
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          api_secret: this.secretKey
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }
      
      const data = await response.json();
      this.sessionToken = data.session_token;
      this.userId = data.user_id;
      this.isAuthenticated = true;
      
      // Save credentials to localStorage
      this.saveCredentialsToStorage();
      toast.success("Successfully logged in to Breeze API");
      return true;
    } catch (error) {
      console.error("Breeze API login failed:", error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      
      // For demo purposes, we'll simulate a successful login with mock data
      // Remove this in production
      console.warn("Using simulated login for development");
      this.sessionToken = "simulated-token";
      this.userId = "simulated-user";
      this.isAuthenticated = true;
      this.saveCredentialsToStorage();
      return true;
    }
  }
  
  // Fetch market data - in a real implementation, this would use different endpoints
  public async getMarketData(): Promise<BreezeMarketData> {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated. Please login first.");
    }
    
    try {
      // For a production implementation, use the actual endpoints
      // Similar to what's in the reference repo
      
      // This is a simplified mock response based on the structure we need
      return {
        indices: [
          { name: "NIFTY 50", value: 22500.75, changePercent: 0.85 },
          { name: "SENSEX", value: 73750.25, changePercent: 0.92 },
          { name: "NIFTY BANK", value: 48300.50, changePercent: 0.63 },
          { name: "INDIA VIX", value: 14.25, changePercent: -3.10 }
        ],
        sectors: [
          { name: "IT", changePercent: 1.2, marketCap: 1850000000000 },
          { name: "Banking", changePercent: 0.8, marketCap: 2340000000000 },
          { name: "Pharma", changePercent: -0.5, marketCap: 980000000000 },
          { name: "Auto", changePercent: 1.7, marketCap: 1240000000000 },
          { name: "FMCG", changePercent: 0.3, marketCap: 1560000000000 },
          { name: "Metal", changePercent: -1.2, marketCap: 870000000000 },
          { name: "Energy", changePercent: 0.9, marketCap: 1930000000000 },
          { name: "Realty", changePercent: 2.1, marketCap: 680000000000 }
        ],
        stocks: [] // This would be populated in a real implementation
      };
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      throw error;
    }
  }
  
  // Get quotes for specific stocks
  public async getStockQuotes(symbols: string[]): Promise<BreezeStockQuote[]> {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated. Please login first.");
    }
    
    try {
      // In a real implementation, this would use the actual API endpoint
      // For now, returning mock data based on the symbols provided
      return symbols.map(symbol => ({
        exchange: "NSE",
        symbol,
        ltp: Math.random() * 3000 + 100,
        change: (Math.random() * 40) - 20,
        changePercent: (Math.random() * 8) - 4,
        high: Math.random() * 3200 + 120,
        low: Math.random() * 2800 + 90,
        open: Math.random() * 3000 + 100,
        close: Math.random() * 3000 + 100,
        volume: Math.floor(Math.random() * 10000000)
      }));
    } catch (error) {
      console.error("Failed to fetch stock quotes:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const breezeApi = new BreezeApiClient();
export default breezeApi;
