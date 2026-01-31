import { supabase } from './lib/supabase';

/**
 * Script to create and configure the case-files storage bucket
 * Run this once to set up storage for file uploads
 */
async function setupStorage() {
    console.log('🚀 Starting storage setup...');

    try {
        // 1. Create the bucket
        console.log('Creating case-files bucket...');
        const { data: bucket, error: bucketError } = await supabase.storage.createBucket('case-files', {
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

        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('✅ Bucket already exists, updating configuration...');

                // Update bucket to ensure it's public
                const { error: updateError } = await supabase.storage.updateBucket('case-files', {
                    public: true,
                    fileSizeLimit: 52428800
                });

                if (updateError) {
                    console.error('❌ Error updating bucket:', updateError);
                } else {
                    console.log('✅ Bucket updated successfully');
                }
            } else {
                throw bucketError;
            }
        } else {
            console.log('✅ Bucket created successfully:', bucket);
        }

        // 2. List buckets to verify
        console.log('\nVerifying buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError);
        } else {
            console.log('📦 Available buckets:', buckets?.map(b => b.name));
            const caseFilesBucket = buckets?.find(b => b.name === 'case-files');
            if (caseFilesBucket) {
                console.log('✅ case-files bucket configuration:', {
                    public: caseFilesBucket.public,
                    fileSizeLimit: caseFilesBucket.file_size_limit,
                    allowedMimeTypes: caseFilesBucket.allowed_mime_types
                });
            }
        }

        console.log('\n✅ Storage setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Go to Supabase Dashboard > Storage > case-files');
        console.log('2. Click on "Policies" tab');
        console.log('3. Create the following policies:');
        console.log('   - Allow authenticated uploads (INSERT)');
        console.log('   - Allow public downloads (SELECT)');
        console.log('   - Allow authenticated updates (UPDATE)');
        console.log('   - Allow authenticated deletes (DELETE)');
        console.log('\nOr run the SQL script from storage_setup_guide.md');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        console.log('\n📖 Please follow the manual setup guide in storage_setup_guide.md');
    }
}

// Run the setup
setupStorage();
