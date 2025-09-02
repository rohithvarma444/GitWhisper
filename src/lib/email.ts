import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false, 
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

export interface IndexingCompletionEmailData {
  userName: string;
  projectName: string;
  githubUrl: string;
  totalFiles: number;
  totalCommits: number;
  processingTime: string;
  userEmail: string;
}

export const sendIndexingCompletionEmail = async (data: IndexingCompletionEmailData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GitWhisper" <${process.env.MAIL_USER}>`,
      to: data.userEmail,
      subject: `🎉 Your ${data.projectName} repository is ready!`,
      html: generateEmailTemplate(data),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Indexing completion email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send indexing completion email:', error);
    return { success: false, error };
  }
};

const generateEmailTemplate = (data: IndexingCompletionEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Repository Indexing Complete</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .project-info {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .project-name {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .github-url {
            color: #3b82f6;
            text-decoration: none;
            word-break: break-all;
        }
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .features {
            margin: 20px 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
        }
        .feature-icon {
            margin-right: 10px;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <div class="logo">GitWhisper</div>
            <div class="subtitle">Your AI-powered codebase guide</div>
        </div>

        <h1 style="text-align: center; color: #1f2937; margin-bottom: 20px;">
            Repository Indexing Complete!
        </h1>

        <p style="text-align: center; color: #6b7280; font-size: 16px;">
            Hi ${data.userName}! Your repository has been successfully indexed and is ready for AI-powered exploration.
        </p>

        <div class="project-info">
            <div class="project-name">📁 ${data.projectName}</div>
            <div>
                <strong>Repository:</strong> 
                <a href="${data.githubUrl}" class="github-url">${data.githubUrl}</a>
            </div>
            <div style="margin-top: 10px; color: #6b7280;">
                <strong>Processing Time:</strong> ${data.processingTime}
            </div>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${data.totalFiles}</div>
                <div class="stat-label">Files Indexed</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${data.totalCommits}</div>
                <div class="stat-label">Commits Analyzed</div>
            </div>
        </div>

        <div class="features">
            <h3 style="color: #1f2937; margin-bottom: 15px;">🚀 What you can do now:</h3>
            <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Ask questions about any part of your codebase</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">🔍</span>
                <span>Search and explore code with AI assistance</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Review commit summaries and changes</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">🎯</span>
                <span>Get contextual explanations for complex code</span>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://git-whisper.vercel.app'}/dashboard" class="cta-button">
                🚀 Start Exploring Your Codebase
            </a>
        </div>

        <div class="footer">
            <p>Thank you for using GitWhisper! We're excited to help you master your codebase.</p>
            <p style="margin-top: 10px;">
                <strong>Need help?</strong> Reply to this email or visit our 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://git-whisper.vercel.app'}" style="color: #3b82f6;">support center</a>.
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                This email was sent because you requested repository indexing on GitWhisper.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};
