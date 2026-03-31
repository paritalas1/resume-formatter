const express = require('express');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LevelFormat, TabStopType, TabStopPosition } = require('docx');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Template color schemes
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
        
        // Log what we received for debugging
        console.log('\n📥 Received resume data:');
        console.log('Name:', resume.name);
        console.log('Contact:', resume.contact);
        console.log('Summary lines:', resume.summary?.length || 0);
        console.log('Experience entries:', resume.experience?.length || 0);
        console.log('Skills entries:', resume.skills?.length || 0);
        console.log('Certifications:', resume.certifications?.length || 0);
        console.log('Education entries:', resume.education?.length || 0);
        console.log('Projects:', resume.projects?.length || 0);
        console.log('Awards:', resume.awards?.length || 0);
        
        const templateConfig = TEMPLATES[template] || TEMPLATES.classic;
        
        const doc = createResumeDocument(resume, templateConfig);
        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'Resume'}_${templateConfig.name}.docx"`);
        res.send(buffer);
        
        console.log('✅ DOCX generated successfully\n');
    } catch (error) {
        console.error('❌ Error generating DOCX:', error);
        res.status(500).json({ error: 'Failed to generate document', details: error.message });
    }
});

function createResumeDocument(resume, config) {
    const sections = [];
    const color = config.color;

    console.log('\n🔨 Building DOCX sections...');

    // HEADER - Name
    if (resume.name) {
        console.log('✓ Adding name');
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.name, bold: true, size: 32, color: '1e293b', font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 }
            })
        );
    }

    // HEADER - Contact
    if (resume.contact) {
        console.log('✓ Adding contact');
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.contact, size: 20, color: '64748b', font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 160 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: color, space: 8 } }
            })
        );
    }

    // PROFESSIONAL SUMMARY
    if (resume.summary && resume.summary.length > 0) {
        console.log(`✓ Adding summary (${resume.summary.length} lines)`);
        sections.push(createSectionHeader('PROFESSIONAL SUMMARY', color));
        resume.summary.forEach(line => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: line, size: 20, color: '334155', font: 'Calibri' })],
                    spacing: { after: 100 },
                    alignment: AlignmentType.LEFT
                })
            );
        });
    }

    // EDUCATION (move up before experience for this format)
    if (resume.education && resume.education.length > 0) {
        console.log(`✓ Adding education (${resume.education.length} entries)`);
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

    // TECHNICAL SKILLS
    if (resume.skills && resume.skills.length > 0) {
        console.log(`✓ Adding skills (${resume.skills.length} categories)`);
        sections.push(createSectionHeader('TECHNICAL SKILLS', color));
        resume.skills.forEach(skill => {
            const children = [];
            if (skill.category) {
                children.push(new TextRun({ text: skill.category + ': ', bold: true, size: 20, color: '1e293b', font: 'Calibri' }));
            }
            children.push(new TextRun({ text: skill.items, size: 20, color: '334155', font: 'Calibri' }));
            
            sections.push(
                new Paragraph({
                    children: children,
                    spacing: { after: 100 }
                })
            );
        });
    }

    // PROFESSIONAL EXPERIENCE
    if (resume.experience && resume.experience.length > 0) {
        console.log(`✓ Adding experience (${resume.experience.length} jobs)`);
        sections.push(createSectionHeader('PROFESSIONAL EXPERIENCE', color));
        
        resume.experience.forEach((job, idx) => {
            console.log(`  → Job ${idx + 1}: ${job.raw || 'Unknown'}`);
            
            // Parse job header (Company — Location | Dates)
            const jobParts = job.raw.split(/[—|]/);
            const company = jobParts[0]?.trim() || '';
            const locationDates = jobParts.slice(1).join(' | ').trim();
            
            // Job header with company on left, dates on right
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: job.title || 'Position', bold: true, size: 21, color: '1e293b', font: 'Calibri' }),
                    ],
                    spacing: { before: 140, after: 40 }
                })
            );
            
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: company, size: 20, color: '475569', font: 'Calibri', italics: true }),
                        new TextRun({ text: '  ·  ', size: 20, color: '64748b', font: 'Calibri' }),
                        new TextRun({ text: locationDates, size: 20, color: '64748b', font: 'Calibri' })
                    ],
                    spacing: { after: 80 }
                })
            );

            // Bullets
            if (job.bullets && job.bullets.length > 0) {
                console.log(`    → ${job.bullets.length} bullets`);
                job.bullets.forEach(bullet => {
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
    } else {
        console.log('⚠️ WARNING: No experience data found!');
    }

    // CERTIFICATIONS & ACHIEVEMENTS
    if (resume.certifications && resume.certifications.length > 0) {
        console.log(`✓ Adding certifications (${resume.certifications.length} items)`);
        sections.push(createSectionHeader('CERTIFICATIONS & ACHIEVEMENTS', color));
        resume.certifications.forEach(cert => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: cert, size: 20, color: '334155', font: 'Calibri' })],
                    numbering: { reference: 'bullets', level: 0 },
                    spacing: { after: 80 }
                })
            );
        });
    } else {
        console.log('⚠️ WARNING: No certifications data found!');
    }

    // PROJECTS
    if (resume.projects && resume.projects.length > 0) {
        console.log(`✓ Adding projects (${resume.projects.length} items)`);
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

    // AWARDS
    if (resume.awards && resume.awards.length > 0) {
        console.log(`✓ Adding awards (${resume.awards.length} items)`);
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

    console.log(`✅ Total sections created: ${sections.length}\n`);

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
    console.log(`\n🚀 Resume Formatter Server Running!`);
    console.log(`📍 Open: http://localhost:${PORT}/resume-formatter-advanced.html\n`);
});
