let pipeline;

/**
 * Loads the embedding model.
 * Uses the Xenova/all-MiniLM-L6-v2 which is small and fast.
 */
async function loadModel() {
    if (!pipeline) {
        const { pipeline: transformerPipeline } = await import('@xenova/transformers');
        pipeline = await transformerPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('✅ Local Embedding Model Loaded (all-MiniLM-L6-v2)');
    }
    return pipeline;
}

/**
 * Converts text into a vector embedding.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function getEmbedding(text) {
    const embedder = await loadModel();
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

module.exports = { getEmbedding };
