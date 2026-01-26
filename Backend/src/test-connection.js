import { prisma } from "./application/database.js";

async function main() {
    console.log("⏳ Sedang mencoba koneksi ke Supabase (ES Module)...");

    try {
        const newMember = await prisma.member.create({
            data: {
                name: "Freya Jayawardana",
                nickname: "Freya",
                generation: 7,
                isActive: true,
                accounts: {
                    create: [
                        {
                            platform: 'INSTAGRAM',
                            username: 'jkt48.freya',
                            url: 'https://instagram.com/jkt48.freya'
                        }
                    ]
                }
            },
        });

        console.log("✅ BERHASIL! Data Freya masuk:");
        console.log(newMember);

    } catch (error) {
        console.error("❌ Gagal Input Data:", error);
    }

    const count = await prisma.member.count();
    console.log(`📊 Total Member di Database: ${count}`);
}

main()
    .catch((e) => {
        console.error("❌ Error Koneksi Utama:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });