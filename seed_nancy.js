
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './backend/.env' });

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

async function seedNancy() {
    console.log('--- Seeding Nancy Admin ---');

    const email = 'nancy@segurosutpl.edu.ec';
    const password = 'password123';

    // 1. Check if user exists (using ListUsers which requires Service Key)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    let nancy = users.find(u => u.email === email);
    let userId;

    if (nancy) {
        console.log('Nancy found. Updating role...');
        userId = nancy.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { app_metadata: { role: 'admin' }, user_metadata: { nombre: 'Nancy', apellido: 'Admin' } }
        );
        if (updateError) console.error('Error updating auth user:', updateError);
    } else {
        console.log('Nancy not found. Creating user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            app_metadata: { role: 'admin' },
            user_metadata: { nombre: 'Nancy', apellido: 'Admin' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        userId = newUser.user.id;
        console.log('User created:', userId);
    }

    // 2. Ensure Profile in public.usuarios
    if (userId) {
        const { error: profileError } = await supabase
            .from('usuarios')
            .upsert({
                id: userId,
                cedula: '1100000000', // Dummy Admin cedula
                nombres: 'Nancy',
                apellidos: 'Administradora',
                tipo_usuario: 'empleado',
                fecha_nacimiento: '1980-01-01',
                estado: 'activo'
            });

        if (profileError) console.error('Error updating public profile:', profileError);
        else console.log('Public profile synchronized.');
    }
}

seedNancy();
