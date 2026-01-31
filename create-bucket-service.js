/**
 * Script para criar bucket usando Service Role Key
 * Execute com: node create-bucket-service.js
 */

const https = require('https');

const SUPABASE_URL = 'wbvkjqfxdpbhpkjzqfqr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidmtqcWZ4ZHBiaHBranpxZnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODI2NTY1NiwiZXhwIjoyMDUzODQxNjU2fQ.gXqKBLqBHDqJuiUWEAGkTHDDOhpkJqXPRWmXVUjdWgE';

console.log('🚀 Criando bucket de storage...\n');

// 1. Criar o bucket
const bucketData = JSON.stringify({
    id: 'case-files',
    name: 'case-files',
    public: true,
    file_size_limit: 52428800,
    allowed_mime_types: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
});

const bucketOptions = {
    hostname: SUPABASE_URL,
    port: 443,
    path: '/storage/v1/bucket',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
    }
};

const createBucket = new Promise((resolve, reject) => {
    const req = https.request(bucketOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✅ Bucket criado com sucesso!');
                console.log('Resposta:', data);
                resolve(data);
            } else if (res.statusCode === 409) {
                console.log('✅ Bucket já existe!');
                resolve(data);
            } else {
                console.log(`❌ Erro ${res.statusCode}:`, data);
                reject(new Error(data));
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Erro na requisição:', error);
        reject(error);
    });

    req.write(bucketData);
    req.end();
});

createBucket
    .then(() => {
        console.log('\n📝 Agora execute este SQL no Supabase:');
        console.log('   (Peça para quem tem acesso ao projeto executar)\n');

        const sql = `-- Políticas de Storage para case-files

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'case-files');`;

        console.log(sql);
        console.log('\n✅ Feito! Aguarde a execução do SQL para completar.');
    })
    .catch((error) => {
        console.error('\n❌ Falha:', error.message);
        console.log('\n📖 Você precisará pedir para quem tem acesso ao projeto:');
        console.log('   1. Criar o bucket "case-files" (público)');
        console.log('   2. Executar o SQL das políticas');
    });
