
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Must be SERVICE_ROLE key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixUserRoles() {
    console.log('--- Fixing User Roles ---');

    // List all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    for (const user of users) {
        const currentRole = user.app_metadata?.role;
        const email = user.email;

        // Skip Nancy
        if (email.includes('nancy')) {
            console.log(`Checking Nancy (${email})... role is ${currentRole}`);
            if (currentRole !== 'admin') {
                console.log('Nancy is NOT admin! Fixing...');
                await supabase.auth.admin.updateUserById(user.id, { app_metadata: { role: 'admin' } });
            }
            continue;
        }

        if (!currentRole) {
            console.log(`User ${email} has NO role. Setting to 'user'...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { app_metadata: { role: 'user' } }
            );

            if (updateError) {
                console.error(`Failed to update ${email}:`, updateError.message);
            } else {
                console.log(`Updated ${email} -> role: user`);
            }
        } else {
            // Downgrade villajean83 if admin
            if (email === 'villajean83@gmail.com' && currentRole === 'admin') {
                console.log(`Downgrading ${email} to 'user' as requested...`);
                await supabase.auth.admin.updateUserById(user.id, { app_metadata: { role: 'user' } });
            } else {
                console.log(`User ${email} has role: ${currentRole}`);
            }
        }
    }
}

fixUserRoles();
