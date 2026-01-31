/**
 * Script para configurar o storage bucket automaticamente
 * Execute com: node configure-storage.js
 */

const { createClient } = require('@supabase/supabase-js');

// Suas credenciais do Supabase
const SUPABASE_URL = 'https://wbvkjqfxdpbhpkjzqfqr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidmtqcWZ4ZHBiaHBranpxZnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODI2NTY1NiwiZXhwIjoyMDUzODQxNjU2fQ.gXqKBLqBHDqJuiUWEAGkTHDDOhpkJqXPRWmXVUjdWgE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setupStorage() {
    console.log('🚀 Iniciando configuração do storage...\n');

    try {
        // 1. Verificar se o bucket já existe
        console.log('📦 Verificando buckets existentes...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Erro ao listar buckets:', listError.message);
            throw listError;
        }

        const bucketExists = buckets?.some(b => b.name === 'case-files');

        if (bucketExists) {
            console.log('✅ Bucket "case-files" já existe!');
            console.log('📝 Atualizando configurações...\n');

            // Atualizar bucket para garantir que está público
            const { error: updateError } = await supabase.storage.updateBucket('case-files', {
                public: true,
                fileSizeLimit: 52428800,
            });

            if (updateError) {
                console.warn('⚠️  Aviso ao atualizar bucket:', updateError.message);
            } else {
                console.log('✅ Configurações do bucket atualizadas!\n');
            }
        } else {
            // 2. Criar o bucket
            console.log('📦 Criando bucket "case-files"...');
            const { data, error } = await supabase.storage.createBucket('case-files', {
                public: true,
                fileSizeLimit: 52428800, // 50MB
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
                throw error;
            }

            console.log('✅ Bucket criado com sucesso!\n');
        }

        // 3. Configurar políticas RLS
        console.log('🔐 Configurando políticas de acesso (RLS)...\n');

        const policies = [
            {
                name: 'Allow authenticated uploads',
                sql: `
                    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
                    CREATE POLICY "Allow authenticated uploads"
                    ON storage.objects
                    FOR INSERT
                    TO authenticated
                    WITH CHECK (bucket_id = 'case-files');
                `
            },
            {
                name: 'Allow public downloads',
                sql: `
                    DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
                    CREATE POLICY "Allow public downloads"
                    ON storage.objects
                    FOR SELECT
                    TO public
                    USING (bucket_id = 'case-files');
                `
            },
            {
                name: 'Allow authenticated updates',
                sql: `
                    DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
                    CREATE POLICY "Allow authenticated updates"
                    ON storage.objects
                    FOR UPDATE
                    TO authenticated
                    USING (bucket_id = 'case-files');
                `
            },
            {
                name: 'Allow authenticated deletes',
                sql: `
                    DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
                    CREATE POLICY "Allow authenticated deletes"
                    ON storage.objects
                    FOR DELETE
                    TO authenticated
                    USING (bucket_id = 'case-files');
                `
            }
        ];

        for (const policy of policies) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });

                if (error) {
                    console.log(`⚠️  Política "${policy.name}": ${error.message}`);
                    console.log('   (Isso é normal se você não tiver permissões de admin)\n');
                } else {
                    console.log(`✅ Política criada: ${policy.name}`);
                }
            } catch (err) {
                console.log(`⚠️  Erro ao criar política "${policy.name}"`);
                console.log('   (Você precisará criar as políticas manualmente no dashboard)\n');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ CONFIGURAÇÃO CONCLUÍDA!');
        console.log('='.repeat(60));
        console.log('\n📝 PRÓXIMOS PASSOS:\n');
        console.log('Se as políticas não foram criadas automaticamente, execute este SQL:');
        console.log('👉 https://supabase.com/dashboard/project/wbvkjqfxdpbhpkjzqfqr/sql/new\n');

        const allSQL = policies.map(p => p.sql).join('\n\n');
        console.log(allSQL);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Agora você pode fazer upload de arquivos na aplicação!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        console.log('\n📖 Consulte o guia manual em: quick_storage_setup.md\n');
        process.exit(1);
    }
}

// Executar
setupStorage();
