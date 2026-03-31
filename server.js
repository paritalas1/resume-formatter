const express = require('express');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LevelFormat } = require('docx');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const TEMPLATES = {
    classic: { color: '2563eb', name: 'Classic Blue' },
    modern: { color: '059669', name: 'Modern Green' },
    executive: { color: '1e293b', name: 'Executive Dark' },
    minimal: { color: 'dc2626', name: 'Minimal Red' },
    creative: { color: '7c3aed', name: 'Creative Purple' }
};

app.post('/generate-docx', async (req, res) => {
    try {
        const { resume, template } = req.body;
        
        console.log('\n' + '='.repeat(80));
        console.log('📥 RECEIVED RESUME DATA FROM FRONTEND');
        console.log('='.repeat(80));
        console.log('Name:', resume.name);
        console.log('Contact:', resume.contact);
        console.log('Summary:', resume.summary?.length || 0, 'lines');
        console.log('Experience:', resume.experience?.length || 0, 'jobs');
        
        if (resume.experience && resume.experience.length > 0) {
            console.log('\n📋 EXPERIENCE DETAILS:');
            resume.experience.forEach((job, idx) => {
                console.log(`  Job ${idx + 1}:`);
                console.log(`    raw: "${job.raw}"`);
                console.log(`    title: "${job.title}"`);
                console.log(`    bullets: ${job.bullets?.length || 0}`);
            });
        } else {
            console.log('\n⚠️  NO EXPERIENCE DATA RECEIVED FROM FRONTEND!');
        }
        
        console.log('\nSkills:', resume.skills?.length || 0, 'categories');
        console.log('Certifications:', resume.certifications?.length || 0, 'items');
        
        if (resume.certifications && resume.certifications.length > 0) {
            console.log('\n🏆 CERTIFICATIONS DETAILS:');
            resume.certifications.forEach((cert, idx) => {
                console.log(`  ${idx + 1}. "${cert}"`);
            });
        } else {
            console.log('\n⚠️  NO CERTIFICATIONS DATA RECEIVED FROM FRONTEND!');
        }
        
        console.log('\nEducation:', resume.education?.length || 0, 'entries');
        console.log('Projects:', resume.projects?.length || 0);
        console.log('Awards:', resume.awards?.length || 0);
        console.log('=' + repeat(80));
        
        const templateConfig = TEMPLATES[template] || TEMPLATES.classic;
        const doc = createResumeDocument(resume, templateConfig);
        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'Resume'}_${templateConfig.name}.docx"`);
        res.send(buffer);
        
        console.log('\n✅ DOCX generated and sent successfully\n');
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Failed to generate document', details: error.message });
    }
});

function createResumeDocument(resume, config) {
    const sections = [];
    const color = config.color;

    console.log('\n🔨 BUILDING DOCX DOCUMENT...\n');

    // Name
    if (resume.name) {
        console.log('✓ Adding NAME');
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.name, bold: true, size: 32, color: '1e293b', font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 }
            })
        );
    }

    // Contact
    if (resume.contact) {
        console.log('✓ Adding CONTACT');
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.contact, size: 20, color: '64748b', font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 160 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: color, space: 8 } }
            })
        );
    }

    // Summary
    if (resume.summary && resume.summary.length > 0) {
        console.log(`✓ Adding SUMMARY (${resume.summary.length} lines)`);
        sections.push(createSectionHeader('PROFESSIONAL SUMMARY', color));
        resume.summary.forEach(line => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: line, size: 20, color: '334155', font: 'Calibri' })],
                    spacing: { after: 100 }
                })
            );
        });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
        console.log(`✓ Adding EDUCATION (${resume.education.length} entries)`);
        sections.push(createSectionHeader('EDUCATION', color));
        resume.education.forEach(edu => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: edu, size: 20, color: '334155', font: 'Calibri' })],
                    spacing: { after: 80 }
                })
            );
        });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
        console.log(`✓ Adding SKILLS (${resume.skills.length} categories)`);
        sections.push(createSectionHeader('TECHNICAL SKILLS', color));
        resume.skills.forEach(skill => {
            const children = [];
            if (skill.category) {
                children.push(new TextRun({ text: skill.category + ': ', bold: true, size: 20, color: '1e293b', font: 'Calibri' }));
            }
            children.push(new TextRun({ text: skill.items, size: 20, color: '334155', font: 'Calibri' }));
            sections.push(new Paragraph({ children, spacing: { after: 100 } }));
        });
    }

    // EXPERIENCE
    if (resume.experience && resume.experience.length > 0) {
        console.log(`✓ Adding PROFESSIONAL EXPERIENCE (${resume.experience.length} jobs)`);
        sections.push(createSectionHeader('PROFESSIONAL EXPERIENCE', color));
        
        resume.experience.forEach((job, idx) => {
            console.log(`  → Processing job ${idx + 1}/${resume.experience.length}`);
            console.log(`     Title: "${job.title}"`);
            console.log(`     Raw: "${job.raw}"`);
            console.log(`     Bullets: ${job.bullets?.length || 0}`);
            
            // Job title
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: job.title || 'Position', bold: true, size: 21, color: '1e293b', font: 'Calibri' })],
                    spacing: { before: 140, after: 40 }
                })
            );
            
            // Company/location/dates
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: job.raw || '', size: 20, color: '475569', font: 'Calibri', italics: true })],
                    spacing: { after: 80 }
                })
            );

            // Bullets
            if (job.bullets && job.bullets.length > 0) {
                job.bullets.forEach((bullet, bidx) => {
                    console.log(`       Bullet ${bidx + 1}: "${bullet.substring(0, 50)}..."`);
                    sections.push(
                        new Paragraph({
                            children: [new TextRun({ text: bullet, size: 20, color: '334155', font: 'Calibri' })],
                            numbering: { reference: 'bullets', level: 0 },
                            spacing: { after: 80 }
                        })
                    );
                });
            }
        });
        console.log('  ✓ Experience section complete');
    } else {
        console.log('⚠️  SKIPPING EXPERIENCE - NO DATA!');
    }

    // CERTIFICATIONS
    if (resume.certifications && resume.certifications.length > 0) {
        console.log(`✓ Adding CERTIFICATIONS (${resume.certifications.length} items)`);
        sections.push(createSectionHeader('CERTIFICATIONS & ACHIEVEMENTS', color));
        resume.certifications.forEach((cert, idx) => {
            console.log(`  → Cert ${idx + 1}: "${cert}"`);
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: cert, size: 20, color: '334155', font: 'Calibri' })],
                    numbering: { reference: 'bullets', level: 0 },
                    spacing: { after: 80 }
                })
            );
        });
        console.log('  ✓ Certifications section complete');
    } else {
        console.log('⚠️  SKIPPING CERTIFICATIONS - NO DATA!');
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
        console.log(`✓ Adding PROJECTS (${resume.projects.length} items)`);
        sections.push(createSectionHeader('PROJECTS', color));
        resume.projects.forEach(project => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: project.name, bold: true, size: 20, color: '1e293b', font: 'Calibri' })],
                    spacing: { before: 100, after: 60 }
                })
            );
            if (project.bullets && project.bullets.length > 0) {
                project.bullets.forEach(bullet => {
                    sections.push(
                        new Paragraph({
                            children: [new TextRun({ text: bullet, size: 20, color: '334155', font: 'Calibri' })],
                            numbering: { reference: 'bullets', level: 0 },
                            spacing: { after: 80 }
                        })
                    );
                });
            }
        });
    }

    // Awards
    if (resume.awards && resume.awards.length > 0) {
        console.log(`✓ Adding AWARDS (${resume.awards.length} items)`);
        sections.push(createSectionHeader('AWARDS & HONORS', color));
        resume.awards.forEach(award => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: award, size: 20, color: '334155', font: 'Calibri' })],
                    numbering: { reference: 'bullets', level: 0 },
                    spacing: { after: 80 }
                })
            );
        });
    }

    console.log(`\n✅ Document complete! Total paragraphs: ${sections.length}\n`);

    return new Document({
        numbering: {
            config: [
                {
                    reference: 'bullets',
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.BULLET,
                            text: '•',
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 360 }
                                }
                            }
                        }
                    ]
                }
            ]
        },
        sections: [{
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                }
            },
            children: sections
        }]
    });
}

function createSectionHeader(text, color) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22, color: '1e293b', font: 'Calibri' })],
        spacing: { before: 280, after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: color, space: 4 } }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ULTRA-DEBUG RESUME FORMATTER SERVER RUNNING');
    console.log('='.repeat(80));
    console.log(`📍 URL: http://localhost:${PORT}/resume-formatter-advanced.html`);
    console.log(`📋 This version logs EVERYTHING to help debug missing sections`);
    console.log('='.repeat(80) + '\n');
});
