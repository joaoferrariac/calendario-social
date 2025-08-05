const STORAGE_KEY = 'calendar_posts';

export const getPostsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Erro ao carregar postagens:', error);
    return {};
  }
};

export const savePostToStorage = (dateKey, postData) => {
  try {
    const posts = getPostsFromStorage();
    
    const migratedData = {
      ...postData,
      feedMedia: postData.feedMedia || (postData.images ? postData.images.map(img => ({ url: img, type: 'image' })) : []),
      storyMedia: postData.storyMedia || (postData.storyImages ? postData.storyImages.map(img => ({ url: img, type: 'image' })) : [])
    };
    
    if (migratedData.images) delete migratedData.images;
    if (migratedData.storyImages) delete migratedData.storyImages;
    if (migratedData.storyImage) delete migratedData.storyImage;
    
    const postWithTimestamp = {
      ...migratedData,
      id: `post_${dateKey}_${Date.now()}`,
      dateKey,
      createdAt: migratedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts[dateKey] = postWithTimestamp;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return postWithTimestamp;
  } catch (error) {
    console.error('Erro ao salvar postagem:', error);
    throw new Error('Falha ao salvar postagem');
  }
};

export const deletePostFromStorage = (dateKey) => {
  try {
    const posts = getPostsFromStorage();
    delete posts[dateKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error('Erro ao excluir postagem:', error);
    throw new Error('Falha ao excluir postagem');
  }
};

export const exportAllPosts = () => {
  try {
    const posts = getPostsFromStorage();
    const exportData = {
      exportDate: new Date().toISOString(),
      totalPosts: Object.keys(posts).length,
      posts
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendario-postagens-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar postagens:', error);
    throw new Error('Falha ao exportar postagens');
  }
};

export const importPosts = (jsonData) => {
  try {
    const importedData = JSON.parse(jsonData);
    const currentPosts = getPostsFromStorage();
    
    const mergedPosts = {
      ...currentPosts,
      ...importedData.posts
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPosts));
    return Object.keys(importedData.posts || {}).length;
  } catch (error) {
    console.error('Erro ao importar postagens:', error);
    throw new Error('Falha ao importar postagens - verifique o formato do arquivo');
  }
};

export const migrateOldPosts = () => {
  try {
    const posts = getPostsFromStorage();
    let migrated = false;
    
    Object.keys(posts).forEach(dateKey => {
      const post = posts[dateKey];
      
      if ((post.images || post.storyImages || post.storyImage) && !post.feedMedia && !post.storyMedia) {
        posts[dateKey] = {
          ...post,
          feedMedia: post.images ? post.images.map(img => ({ url: img, type: 'image' })) : [],
          storyMedia: post.storyImages ? post.storyImages.map(img => ({ url: img, type: 'image' })) : 
                     post.storyImage ? [{ url: post.storyImage, type: 'image' }] : []
        };
        
        delete posts[dateKey].images;
        delete posts[dateKey].storyImages;
        delete posts[dateKey].storyImage;
        migrated = true;
      }
    });
    
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
    
    return posts;
  } catch (error) {
    console.error('Erro na migração:', error);
    return getPostsFromStorage();
  }
};