import { supabase } from './supabase';

/**
 * Initialize storage bucket for case files
 * This function will:
 * 1. Create the bucket if it doesn't exist
 * 2. Provide SQL script for RLS policies
 * 
 * Usage in browser console:
 * await window.initializeStorage()
 */
export async function initializeStorage() {
    console.log('🚀 Initializing storage bucket...');

    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            return { success: false, error: listError.message };
        }

        const bucketExists = buckets?.some(b => b.name === 'case-files');

        if (bucketExists) {
            console.log('✅ Storage bucket "case-files" already exists');

            // Try to update bucket to ensure it's public
            const { error: updateError } = await supabase.storage.updateBucket('case-files', {
                public: true,
                fileSizeLimit: 52428800,
            });

            if (updateError) {
                console.warn('⚠️  Could not update bucket settings:', updateError.message);
            } else {
                console.log('✅ Bucket settings updated');
            }

            console.log('\n📝 Make sure RLS policies are set up. Run this SQL:');
            printPoliciesSQL();

            return { success: true, message: 'Bucket already exists and is configured' };
        }

        // Create bucket
        console.log('📦 Creating new bucket "case-files"...');
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
            console.error('❌ Error creating bucket:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Storage bucket created successfully!');
        console.log('\n⚠️  IMPORTANT: Now you need to set up RLS policies!');
        console.log('📝 Copy and run this SQL in Supabase Dashboard:');
        console.log('   https://supabase.com/dashboard/project/wbvkjqfxdpbhpkjzqfqr/sql/new\n');

        printPoliciesSQL();

        return { success: true, message: 'Bucket created successfully' };
    } catch (error: any) {
        console.error('❌ Failed to initialize storage:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Print the SQL script for RLS policies
 */
function printPoliciesSQL() {
    const sql = `
-- Storage RLS Policies for case-files bucket

-- 1. Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

-- 2. Allow public downloads
CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-files');

-- 3. Allow authenticated users to update files
CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'case-files');

-- 4. Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'case-files');
`;

    console.log(sql);
    console.log('\n✅ After running the SQL, your storage will be fully configured!');
}

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
    (window as any).initializeStorage = initializeStorage;
}
