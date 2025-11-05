# Keora Admin Guide

Comprehensive guide for platform administrators and moderators.

## Table of Contents

1. [Admin Access & Roles](#admin-access--roles)
2. [Admin Dashboard](#admin-dashboard)
3. [User Management](#user-management)
4. [Content Moderation](#content-moderation)
5. [System Settings](#system-settings)
6. [Audit Logs](#audit-logs)
7. [Best Practices](#best-practices)
8. [Security Guidelines](#security-guidelines)
9. [Troubleshooting](#troubleshooting)

---

## Admin Access & Roles

### Admin Roles

Keora has three admin roles with different permissions:

**Super Admin**
- Full system access
- User management (including deletion)
- System settings configuration
- Admin role management
- All moderation capabilities
- Access to all audit logs

**Moderator**
- Content moderation
- Flag review and resolution
- User warnings and suspensions
- Limited user management
- View audit logs (limited)

**Support**
- View user information
- Password reset assistance
- Help with user issues
- No moderation capabilities
- Limited audit log access

### Accessing Admin Panel

1. **Login as Admin**
   - Go to https://keora.com/login
   - Use your admin credentials
   - Complete 2FA if enabled

2. **Navigate to Admin Dashboard**
   - Click "Admin Dashboard" button in top right
   - Or go directly to https://keora.com/admin

3. **Security Note**
   - Admin sessions expire after 1 hour of inactivity
   - Always logout when finished
   - Never share admin credentials

---

## Admin Dashboard

### Dashboard Overview

The admin dashboard provides real-time statistics and quick access to key functions.

### Key Metrics

**User Statistics:**
- **Total Users:** All registered accounts
- **Verified Users:** Accounts with confirmed email and mobile
- **New Users (30d):** Registrations in last 30 days
- **Active Users (7d):** Users who logged in within last week
- **Verification Rate:** Percentage of verified users

**Content Statistics:**
- **Family Members:** Total profiles created
- **Relationships:** Total connections established
- **Pending Link Requests:** Awaiting approval
- **Flagged Content:** Reports requiring review

**Growth Trends:**
- Daily user registration graph
- 30-day trend analysis
- User engagement metrics

### Recent Activity

View the 10 most recent user registrations with:
- User name and email
- Registration date
- Verification status
- Quick access to user profile

### Quick Actions

One-click access to:
- User Management
- Content Moderation
- System Settings
- Reports

---

## User Management

### Viewing Users

**Navigate:** Admin Dashboard > Users

**Features:**
- List all users with pagination (20 per page)
- Search by name, email, or mobile
- Filter by verification status
- Filter by account status (active/suspended)
- Sort by join date, last login, or name

### User Information

Click any user to view:
- **Basic Info:** Name, email, mobile, photo
- **Account Status:** Verified, suspended, admin role
- **Activity:** Last login, join date
- **Content:** Number of family members, relationships
- **Sessions:** Active login sessions with device info
- **Requests:** Sent and received connection requests

### User Actions

**Verify User**
- Manually verify email and mobile
- Use when user has verification issues
- Bypasses OTP requirement

**Suspend User**
- Temporarily block account access
- User cannot login while suspended
- Requires reason (logged in audit)
- User receives email notification

**Unsuspend User**
- Restore account access
- Clears suspension reason
- Logged in audit

**Reset Password**
- Generate new OTP for user
- Send to user's email and mobile
- User must complete reset process
- Logged in audit for security

**Delete User** (Super Admin Only)
- Permanently removes account
- Deletes all family members and relationships
- Cannot be undone
- Requires confirmation
- Cannot delete other admin accounts

### Suspension Guidelines

**When to Suspend:**
- Terms of Service violations
- Spam or abusive behavior
- Fake profile reports (verified)
- Harassment complaints
- Privacy violations
- Multiple failed login attempts (automatic)

**Suspension Reasons (Examples):**
- "Spam: Sending unsolicited connection requests"
- "Harassment: Multiple reports from users"
- "Fake Profile: Impersonating another person"
- "Privacy Violation: Sharing others' information without consent"
- "Multiple ToS violations"

**When NOT to Suspend:**
- First-time minor violations (warn instead)
- Technical issues (help resolve instead)
- Misunderstandings (clarify policies)

### User Search Tips

**Search Examples:**
- `john@example.com` - Find by exact email
- `+1234567890` - Find by phone number
- `john smith` - Search by name (partial match)
- `john` - Find all Johns

**Using Filters:**
- Unverified users: Check for potential spam accounts
- Suspended users: Review suspension reasons
- Admin users: Audit admin accounts

---

## Content Moderation

### Flagged Content

**Navigate:** Admin Dashboard > Moderation

Content can be flagged for:
- **Spam:** Unsolicited or repetitive content
- **Inappropriate:** Offensive or explicit content
- **Fake Profile:** Impersonation or false information
- **Harassment:** Bullying or threatening behavior
- **Other:** User-specified reasons

### Review Process

1. **View Flag Queue**
   - Sorted by date (oldest first)
   - Shows reporter, content type, reason
   - Quick preview of flagged content

2. **Review Content**
   - View full context
   - Check reporter's history
   - Check reported user's history
   - Assess severity

3. **Take Action**
   - **Approve:** Content is fine, dismiss flag
   - **Remove:** Delete content (warns user)
   - **Warn User:** Send warning, keep content
   - **Ban User:** Suspend account

4. **Add Review Notes**
   - Document your decision
   - Note for other moderators
   - Visible in audit logs

### Moderation Guidelines

**Content Removal Criteria:**
- Violates Terms of Service
- Illegal content
- Explicit or offensive material
- Personal information without consent
- Verifiable false information

**Warning vs. Removal:**
- First offense: Warning
- Minor violation: Warning
- Major violation: Removal + Warning
- Repeat offense: Removal + Suspension

**Ban/Suspension Criteria:**
- Multiple violations (3+ warnings)
- Severe single violation
- Illegal activity
- Coordinated spam or harassment

### Handling Reports

**Valid Report:**
1. Confirm violation
2. Take appropriate action
3. Add review notes
4. Mark as "Reviewed"
5. Notify reporter of outcome (optional)

**Invalid Report:**
1. Verify content is acceptable
2. Mark as "Approved"
3. Add notes explaining decision
4. Consider warning reporter if frivolous

**Unclear Cases:**
1. Consult moderation team
2. Escalate to senior moderator
3. Document uncertainty in notes
4. Don't rush to judgment

---

## System Settings

**Navigate:** Admin Dashboard > Settings

### WhatsApp API Configuration

- **API Key:** From provider (Gupshup/Interakt/Twilio)
- **API URL:** Provider endpoint
- **Sender ID:** Verified WhatsApp number

**Testing:**
- Use "Send Test Message" button
- Verify OTP delivery
- Check logs for errors

### Email Service Configuration

- **SMTP Settings:** Server, port, credentials
- **SendGrid/Resend:** API key configuration
- **From Address:** noreply@keora.com (or custom)
- **Templates:** Customize email templates

**Testing:**
- Send test email to your account
- Check deliverability
- Verify formatting

### Feature Flags

Enable/disable features platform-wide:
- **Social Login:** Google, Facebook integration
- **Public Trees:** Allow public tree visibility
- **Search:** Enable user search feature
- **Exports:** Allow tree exports (PDF, PNG)

### Rate Limiting

Configure to prevent abuse:
- **Login Attempts:** 5 per 15 minutes (recommended)
- **API Requests:** 100 per 15 minutes per user
- **Connection Requests:** 10 per day per user
- **Flag Reports:** 5 per day per user

### Maintenance Mode

- **Enable:** Block all non-admin access
- **Message:** Custom message to users
- **Use Cases:** Updates, migrations, emergencies

---

## Audit Logs

**Navigate:** Admin Dashboard > Audit Logs

### What's Logged

Every admin action is logged:
- User management actions
- Moderation decisions
- Settings changes
- Admin role changes
- Login/logout events

### Log Information

Each entry contains:
- **Timestamp:** Exact date and time
- **Admin:** Who performed the action
- **Action:** What was done
- **Target:** Affected user/content
- **Details:** Reason, notes, changes
- **IP Address:** For security tracking

### Filtering Logs

**By Admin:**
- View specific admin's actions
- Audit individual moderators
- Review all actions by role

**By Action Type:**
- User suspensions
- Content removals
- Settings changes
- Password resets

**By Date Range:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

### Audit Best Practices

**Regular Reviews:**
- Review daily for high-priority actions
- Weekly review of all logs
- Monthly audit of admin accounts

**What to Look For:**
- Unusual patterns (multiple suspensions)
- Off-hours activity
- Unauthorized access attempts
- Policy violations by admins

**Reporting Issues:**
- Document suspicious activity
- Report to Super Admin
- Preserve logs for investigation

---

## Best Practices

### User Management

1. **Be Fair and Consistent**
   - Apply policies uniformly
   - Document all decisions
   - Treat similar cases similarly

2. **Communicate Clearly**
   - Explain suspension reasons
   - Cite specific policy violations
   - Offer appeal process

3. **Act Promptly**
   - Respond to reports within 24 hours
   - Address urgent issues immediately
   - Keep users informed of progress

### Content Moderation

1. **Assume Good Intent**
   - Give benefit of doubt for borderline cases
   - Consider context and intent
   - Warn before removing when possible

2. **Be Objective**
   - Base decisions on policies, not personal views
   - Seek second opinion for unclear cases
   - Document reasoning

3. **Escalate When Needed**
   - Don't guess on legal issues
   - Consult senior moderator for complex cases
   - Refer serious violations to leadership

### Security

1. **Protect Admin Access**
   - Use strong, unique password
   - Enable 2FA (when available)
   - Never share credentials
   - Logout after each session

2. **Handle User Data Carefully**
   - Only access when necessary
   - Never share user information
   - Follow data protection policies
   - Report security concerns immediately

3. **Monitor for Threats**
   - Watch for coordinated attacks
   - Identify spam campaigns
   - Report suspicious patterns
   - Document security incidents

---

## Security Guidelines

### Account Security

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Change every 90 days
- Never reuse passwords

**2FA (Two-Factor Authentication):**
- Enable for all admin accounts
- Use authenticator app (recommended)
- Keep backup codes secure
- Re-verify on new devices

**Session Management:**
- Max 1-hour idle timeout
- Logout when leaving workstation
- Review active sessions regularly
- Report unauthorized sessions immediately

### Data Protection

**User Privacy:**
- Access user data only when necessary
- Don't share user information externally
- Follow GDPR/privacy regulations
- Document reasons for data access

**Confidentiality:**
- Don't discuss moderation cases publicly
- Keep internal discussions private
- Protect sensitive information
- Use secure communication channels

**Data Handling:**
- Don't download user data unnecessarily
- Secure any exported reports
- Delete temporary files
- Follow data retention policies

### Incident Response

**Security Incident:**
1. Document immediately
2. Notify Super Admin
3. Preserve evidence (logs, screenshots)
4. Follow incident response plan
5. Don't discuss publicly

**Data Breach:**
1. Report immediately
2. Do not investigate alone
3. Preserve all evidence
4. Follow legal requirements
5. Cooperate with investigation

**Account Compromise:**
1. Change password immediately
2. Logout all sessions
3. Report to Super Admin
4. Review audit logs
5. Enable 2FA if not active

---

## Troubleshooting

### Dashboard Not Loading

**Issue:** Admin dashboard shows errors or won't load

**Solutions:**
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Use different browser
4. Check if you have admin permissions
5. Verify your admin account isn't suspended
6. Contact Super Admin if issue persists

### Can't Suspend User

**Issue:** Suspension action fails

**Possible Causes:**
- User is also an admin (cannot suspend admins)
- Insufficient permissions (Moderator role required)
- User already suspended
- Technical error

**Solutions:**
1. Check user's admin status
2. Verify your role has suspension permissions
3. Check if already suspended
4. Try again after refreshing page
5. Report bug if issue persists

### Audit Logs Missing

**Issue:** Expected logs not appearing

**Possible Causes:**
- Delay in log processing (up to 1 minute)
- Filter settings too restrictive
- Date range doesn't include action
- Technical issue

**Solutions:**
1. Wait 1-2 minutes and refresh
2. Clear all filters
3. Expand date range
4. Check if action actually completed
5. Report if logs are genuinely missing

### Email/WhatsApp Not Sending

**Issue:** Users report not receiving notifications

**Check:**
1. System Settings > Email/WhatsApp Config
2. Verify API keys are correct
3. Check service provider status
4. Review error logs
5. Test with your own account

**Solutions:**
1. Re-enter API credentials
2. Contact service provider support
3. Switch to backup provider if configured
4. Report to tech team if widespread

---

## Emergency Procedures

### Platform Attack

**Signs:**
- Sudden spike in registrations
- Mass spam or abusive content
- Coordinated harassment campaign
- System performance degradation

**Actions:**
1. Enable Maintenance Mode (Settings)
2. Document the attack (screenshots, logs)
3. Notify Super Admin immediately
4. Don't delete evidence
5. Follow incident response plan

### Compromised Admin Account

**If Your Account:**
1. Change password immediately
2. Logout all sessions
3. Enable 2FA
4. Report to Super Admin
5. Review audit logs for unauthorized actions

**If Another Admin:**
1. Report to Super Admin immediately
2. Do not confront the admin
3. Preserve evidence
4. Follow instructions from leadership

### Legal Request

**If you receive:**
- Law enforcement request
- Subpoena
- Legal notice
- Court order

**DO NOT:**
- Provide any information
- Delete any data
- Discuss with the requestor

**DO:**
1. Forward to legal@keora.com immediately
2. Document the request
3. Do not take any action
4. Wait for legal team instructions

---

## Getting Help

### Admin Support

**Email:** admin-support@keora.com
**Slack:** #admin-support (internal)
**Escalation:** Super Admin team

### Resources

- **Policy Documentation:** /docs/policies
- **Moderation Guidelines:** /docs/moderation
- **Technical Documentation:** See DEVELOPER.md
- **Training Videos:** /admin/training

### Reporting Issues

**For Bug Reports:**
- Describe the issue clearly
- Include steps to reproduce
- Attach screenshots if applicable
- Note browser/device information

**For Security Issues:**
- Use secure email: security@keora.com
- Don't discuss publicly
- Provide detailed information
- Wait for acknowledgment

---

## Appendix

### Common Actions Quick Reference

| Task | Path | Notes |
|------|------|-------|
| Suspend User | Users > [User] > Suspend | Requires reason |
| Verify User | Users > [User] > Verify | Bypasses OTP |
| Reset Password | Users > [User] > Reset Password | Sends OTP to user |
| Review Flag | Moderation > [Flag] > Review | Add notes |
| View Logs | Audit Logs > Filter by action | Use filters for specific actions |
| Change Settings | Settings > [Category] | Super Admin only |

### Status Badges Meaning

- **🟢 Verified:** Email and mobile confirmed
- **🟡 Unverified:** Awaiting verification
- **🔴 Suspended:** Account locked
- **🔵 Admin:** Has admin privileges
- **⚪ Pending:** Action in progress

---

**Remember:** As an admin, you represent Keora. Always act professionally, fairly, and in accordance with our values and policies.

*Last Updated: January 2025*
