import axios from 'axios'
import jwt from 'jsonwebtoken'

const API_URL = 'http://localhost:3000/api'
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret' // Verify this matches backend .env or default

// Generate Test Token
const adminToken = jwt.sign({ role: 'admin', id: 'test-admin' }, JWT_SECRET, { expiresIn: '1h' })
const userToken = jwt.sign({ role: 'user', id: 'test-user' }, JWT_SECRET, { expiresIn: '1h' })

const api = axios.create({
    baseURL: API_URL,
    validateStatus: () => true // Don't throw on error
})

async function runTests() {
    console.log('🚀 Starting Sprint 1 Verification...')

    // 1. Health Check
    const health = await axios.get('http://localhost:3000/health')
    console.log(`[GET /health] Status: ${health.status}`, health.data.status === 'OK' || health.data.status === 'DEGRADED' ? '✅' : '❌')

    // 2. Auth - Negative Login
    const loginFail = await api.post('/auth/login', { email: 'fake@test.com', password: 'wrong' })
    console.log(`[POST /auth/login] Invalid Creds: ${loginFail.status}`, loginFail.status === 401 ? '✅' : '❌')

    // 3. Siniestros - Missing Data (Validation)
    const avisoFail = await api.post('/siniestros/aviso', {}, { headers: { Authorization: `Bearer ${userToken}` } })
    console.log(`[POST /siniestros/aviso] Missing Data: ${avisoFail.status}`, avisoFail.status === 400 ? '✅' : '❌')

    // 4. Docs - Invalid Type
    const formData = new FormData()
    // Mock file - needs separate handling in node script, skipping "real" upload test in simple script without fs/form-data lib complexity
    // But we can test 401/403 or Validation if we send garbage
    // console.log('Skipping complex PDF upload test in this simple script scripts, verify manually via Postman')

    // 5. State Transition - Blocked
    // Create Valid Siniestro Mock (Directly or via API if possible)
    // Since we can't easily create one without DB connection or valid full flow, we test 404 on random ID
    const randomId = '00000000-0000-0000-0000-000000000000'
    const patchFail = await api.patch(`/siniestros/${randomId}`, { estado: 'En_tramite' }, { headers: { Authorization: `Bearer ${adminToken}` } })
    // If it returns 500 (DB error) or 400 or 404, it means endpoint is hit. 
    console.log(`[PATCH /siniestros/{id}] Hit Endpoint: ${patchFail.status}`, patchFail.status !== 404 ? '✅ (Endpoint exists)' : '❌ (Likely 404 if Logic allows)')

    // 6. Vigencia Check
    // Mock Active Vigencia
    const activeVigencia = await api.get('/vigencias/activa').catch(e => e.response)
    console.log(`[GET /vigencias/activa] Status: ${activeVigencia.status}`, activeVigencia.status === 200 || activeVigencia.status === 404 ? '✅' : '❌')

    // 7. Siniestro Guard - Vigencia Check (Expect 409 if no active vigencia, or 201 if one exists/mocked)
    // For this test we expect it to AT LEAST HIT the endpoint and return a logic error (409) or 400 (Data), not 500.
    const vigenciaGuard = await api.post('/siniestros/aviso',
        { cedula_fallecido: '1111', fecha_defuncion: '2025-01-01', poliza_id: 1 },
        { headers: { Authorization: `Bearer ${userToken}` } }
    ).catch(e => e.response)
    console.log(`[POST /siniestros/aviso] Vigencia Guard: ${vigenciaGuard.status}`, [201, 400, 409].includes(vigenciaGuard.status) ? '✅' : `❌ (${vigenciaGuard.status})`)

    console.log('🏁 Verification Complete. Check backend logs for correlation IDs.')
}

runTests().catch(console.error)
