import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

class InstagramService {
  constructor() {
    this.baseURL = 'https://graph.instagram.com';
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  }

  /**
   * Publica uma imagem no Instagram
   * @param {string} imagePath - Caminho para a imagem
   * @param {string} caption - Legenda do post
   * @returns {Promise<Object>} Resultado da publicação
   */
  async publishImage(imagePath, caption) {
    try {
      if (!this.accessToken || !this.businessAccountId) {
        throw new Error('Credenciais do Instagram não configuradas');
      }

      // 1. Fazer upload da mídia
      const mediaId = await this.uploadMedia(imagePath, caption);
      
      // 2. Publicar o post
      const result = await this.publishMedia(mediaId);
      
      return {
        success: true,
        postId: result.id,
        message: 'Post publicado com sucesso no Instagram'
      };
    } catch (error) {
      console.error('Erro ao publicar no Instagram:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Publica múltiplas imagens como carrossel
   * @param {Array<string>} imagePaths - Array de caminhos das imagens
   * @param {string} caption - Legenda do post
   * @returns {Promise<Object>} Resultado da publicação
   */
  async publishCarousel(imagePaths, caption) {
    try {
      if (!this.accessToken || !this.businessAccountId) {
        throw new Error('Credenciais do Instagram não configuradas');
      }

      // 1. Upload de todas as mídias
      const mediaIds = [];
      for (const imagePath of imagePaths) {
        const mediaId = await this.uploadMedia(imagePath);
        mediaIds.push({ media_id: mediaId });
      }

      // 2. Criar container do carrossel
      const carouselContainer = await this.createCarouselContainer(mediaIds, caption);
      
      // 3. Publicar o carrossel
      const result = await this.publishMedia(carouselContainer.id);
      
      return {
        success: true,
        postId: result.id,
        message: 'Carrossel publicado com sucesso no Instagram'
      };
    } catch (error) {
      console.error('Erro ao publicar carrossel no Instagram:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Faz upload de uma mídia para o Instagram
   * @param {string} imagePath - Caminho da imagem
   * @param {string} caption - Legenda (opcional)
   * @returns {Promise<string>} ID da mídia
   */
  async uploadMedia(imagePath, caption = '') {
    const url = `${this.baseURL}/${this.businessAccountId}/media`;
    
    const params = {
      image_url: this.getPublicImageUrl(imagePath),
      caption: caption,
      access_token: this.accessToken
    };

    const response = await axios.post(url, params);
    return response.data.id;
  }

  /**
   * Cria container para carrossel
   * @param {Array} mediaIds - Array de IDs de mídia
   * @param {string} caption - Legenda
   * @returns {Promise<Object>} Container do carrossel
   */
  async createCarouselContainer(mediaIds, caption) {
    const url = `${this.baseURL}/${this.businessAccountId}/media`;
    
    const params = {
      media_type: 'CAROUSEL',
      children: mediaIds,
      caption: caption,
      access_token: this.accessToken
    };

    const response = await axios.post(url, params);
    return response.data;
  }

  /**
   * Publica uma mídia já enviada
   * @param {string} mediaId - ID da mídia
   * @returns {Promise<Object>} Resultado da publicação
   */
  async publishMedia(mediaId) {
    const url = `${this.baseURL}/${this.businessAccountId}/media_publish`;
    
    const params = {
      creation_id: mediaId,
      access_token: this.accessToken
    };

    const response = await axios.post(url, params);
    return response.data;
  }

  /**
   * Converte caminho local em URL pública
   * @param {string} localPath - Caminho local da imagem
   * @returns {string} URL pública da imagem
   */
  getPublicImageUrl(localPath) {
    // Remove o prefixo '/uploads/' se existir
    const filename = localPath.replace('/uploads/', '');
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${filename}`;
  }

  /**
   * Valida se as credenciais estão configuradas
   * @returns {boolean} Status da configuração
   */
  isConfigured() {
    return !!(this.accessToken && this.businessAccountId);
  }

  /**
   * Obtém informações da conta
   * @returns {Promise<Object>} Informações da conta
   */
  async getAccountInfo() {
    try {
      if (!this.isConfigured()) {
        throw new Error('Credenciais não configuradas');
      }

      const url = `${this.baseURL}/${this.businessAccountId}`;
      const params = {
        fields: 'id,username,followers_count,media_count',
        access_token: this.accessToken
      };

      const response = await axios.get(url, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default InstagramService;
