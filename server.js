const express = require('express');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LevelFormat } = require('docx');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '10mb' }));
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
        const templateConfig = TEMPLATES[template] || TEMPLATES.classic;
        
        const doc = createResumeDocument(resume, templateConfig);
        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'Resume'}_${templateConfig.name}.docx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error generating DOCX:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});

function createResumeDocument(resume, config) {
    const sections = [];
    const color = config.color;

    // Header
    if (resume.name) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.name, bold: true, size: 32, color: '1e293b' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 }
            })
        );
    }

    if (resume.contact) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: resume.contact, size: 20, color: '64748b' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: color, space: 8 } }
            })
        );
    }

    // Summary
    if (resume.summary && resume.summary.length > 0) {
        sections.push(createSectionHeader('PROFESSIONAL SUMMARY', color));
        resume.summary.forEach(line => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: line, size: 20, color: '334155' })],
                    spacing: { after: 80 }
                })
            );
        });
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
        sections.push(createSectionHeader('PROFESSIONAL EXPERIENCE', color));
        resume.experience.forEach(job => {
            // Job header
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: job.raw, bold: true, size: 20, color: '1e293b' })],
                    spacing: { before: 100, after: 40 }
                })
            );
            
            // Job title
            if (job.title) {
                sections.push(
                    new Paragraph({
                        children: [new TextRun({ text: job.title, italics: true, size: 20, color: '475569' })],
                        spacing: { after: 60 }
                    })
                );
            }

            // Bullets
            job.bullets.forEach(bullet => {
                sections.push(
                    new Paragraph({
                        children: [new TextRun({ text: bullet, size: 20, color: '334155' })],
                        numbering: { reference: 'bullets', level: 0 },
                        spacing: { after: 60 }
                    })
                );
            });
        });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
        sections.push(createSectionHeader('TECHNICAL SKILLS', color));
        resume.skills.forEach(skill => {
            const children = [];
            if (skill.category) {
                children.push(new TextRun({ text: skill.category + ': ', bold: true, size: 20, color: '1e293b' }));
            }
            children.push(new TextRun({ text: skill.items, size: 20, color: '334155' }));
            
            sections.push(
                new Paragraph({
                    children: children,
                    spacing: { after: 60 }
                })
            );
        });
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
        sections.push(createSectionHeader('CERTIFICATIONS', color));
        resume.certifications.forEach(cert => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: cert, size: 20, color: '334155' })],
                    numbering: { reference: 'bullets', level: 0 },
                    spacing: { after: 60 }
                })
            );
        });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
        sections.push(createSectionHeader('EDUCATION', color));
        resume.education.forEach(edu => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: edu, size: 20, color: '334155' })],
                    spacing: { after: 60 }
                })
            );
        });
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
        sections.push(createSectionHeader('PROJECTS', color));
        resume.projects.forEach(project => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: project.name, bold: true, size: 20, color: '1e293b' })],
                    spacing: { before: 80, after: 40 }
                })
            );
            project.bullets.forEach(bullet => {
                sections.push(
                    new Paragraph({
                        children: [new TextRun({ text: bullet, size: 20, color: '334155' })],
                        numbering: { reference: 'bullets', level: 0 },
                        spacing: { after: 60 }
                    })
                );
            });
        });
    }

    // Awards
    if (resume.awards && resume.awards.length > 0) {
        sections.push(createSectionHeader('AWARDS & HONORS', color));
        resume.awards.forEach(award => {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: award, size: 20, color: '334155' })],
                    numbering: { reference: 'bullets', level: 0 },
                    spacing: { after: 60 }
                })
            );
        });
    }

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
        children: [new TextRun({ text, bold: true, size: 22, color: '1e293b' })],
        spacing: { before: 240, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: color, space: 4 } }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Resume Formatter Server Running!`);
    console.log(`📍 Open: http://localhost:${PORT}/resume-formatter-advanced.html\n`);
});
