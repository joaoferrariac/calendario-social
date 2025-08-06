class InstagramOAuthService {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/instagram-auth/callback';
  }

  // Gerar URL de autorização
  getAuthUrl() {
    const scope = 'user_profile,user_media';
    const state = this.generateState();
    
    return `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  }

  // Trocar código por token
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code,
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Obter token de longa duração
        return await this.getLongLivedToken(data.access_token);
      }
      
      throw new Error('Falha ao obter token');
    } catch (error) {
      console.error('Erro ao trocar código por token:', error);
      throw error;
    }
  }

  // Obter token de longa duração
  async getLongLivedToken(shortLivedToken) {
    try {
      const response = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${shortLivedToken}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao obter token de longa duração:', error);
      throw error;
    }
  }

  // Renovar token
  async refreshToken(token) {
    try {
      const response = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default new InstagramOAuthService();
