import { supabase } from './supabase';

/**
 * Script para configurar o storage bucket automaticamente
 * Execute no console do navegador ou como parte da aplicação
 */

async function setupStorageComplete() {
    console.log('🚀 Iniciando configuração completa do storage...\n');

    try {
        // 1. Criar o bucket
        console.log('📦 Criando bucket "case-files"...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Erro ao listar buckets:', listError.message);
            return { success: false, error: listError.message };
        }

        const bucketExists = buckets?.some(b => b.name === 'case-files');

        if (!bucketExists) {
            const { data, error } = await supabase.storage.createBucket('case-files', {
                public: true,
                fileSizeLimit: 52428800,
                allowedMimeTypes: [
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ]
            });

            if (error) {
                console.error('❌ Erro ao criar bucket:', error.message);
                return { success: false, error: error.message };
            }

            console.log('✅ Bucket criado com sucesso!');
        } else {
            console.log('✅ Bucket já existe!');

            // Atualizar para garantir que está público
            await supabase.storage.updateBucket('case-files', {
                public: true,
                fileSizeLimit: 52428800,
            });
            console.log('✅ Configurações atualizadas!');
        }

        // 2. Mostrar SQL para políticas
        console.log('\n🔐 AGORA EXECUTE ESTE SQL NO SUPABASE:\n');
        console.log('👉 https://supabase.com/dashboard/project/wbvkjqfxdpbhpkjzqfqr/sql/new\n');

        const sql = `-- Políticas de Storage para case-files

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'case-files');

DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'case-files');

DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'case-files');

DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'case-files');`;

        console.log(sql);
        console.log('\n✅ Copie o SQL acima e execute no link fornecido!\n');

        return {
            success: true,
            message: 'Bucket criado! Execute o SQL para completar.',
            sql: sql
        };

    } catch (error) {
        console.error('❌ Erro:', error);
        return { success: false, error: error.message };
    }
}

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
    (window as any).setupStorageComplete = setupStorageComplete;
    console.log('✅ Função disponível! Execute: await window.setupStorageComplete()');
}

export { setupStorageComplete };
