import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase client sử dụng biến môi trường của Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projects-grid');
    const modal = document.getElementById('add-modal');
    const addBtn = document.getElementById('add-project-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-form');
    const submitBtn = document.getElementById('submit-btn');

    // Mở Modal
    addBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    // Đóng Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Bấm ra ngoài để đóng
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    const getIconForLink = (key) => {
        const icons = {
            domain: 'bx-globe',
            github: 'bxl-github',
            vercel: 'bx-cloud-upload',
            supabase: 'bx-data',
            default: 'bx-link-external'
        };
        return icons[key] || icons.default;
    };

    const formatLabel = (key) => {
        const labels = {
            domain: 'Truy cập Website',
            github: 'Mã nguồn (GitHub)',
            vercel: 'Hosting (Vercel)',
            supabase: 'Database (Supabase)'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    const renderProjects = (projects) => {
        grid.innerHTML = '';
        if (!projects || projects.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Chưa có dự án nào. Bấm "Thêm Dự Án" để bắt đầu nhé!</p>';
            return;
        }

        projects.forEach(project => {
            const tagsHtml = project.tags && project.tags.length > 0 ? 
                project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

            let linksHtml = '';
            
            if (project.domain) {
                linksHtml += `
                    <a href="${project.domain}" target="_blank" rel="noopener noreferrer" class="link-btn domain">
                        <i class='bx ${getIconForLink('domain')}'></i> ${formatLabel('domain')}
                    </a>
                `;
            }
            
            ['github', 'vercel', 'supabase', 'other_link'].forEach(key => {
                if (project[key]) {
                    linksHtml += `
                        <a href="${project[key]}" target="_blank" rel="noopener noreferrer" class="link-btn">
                            <i class='bx ${getIconForLink(key === 'other_link' ? 'default' : key)}'></i> 
                            ${formatLabel(key === 'other_link' ? 'Link Khác' : key)}
                        </a>
                    `;
                }
            });

            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.setProperty('--card-accent', project.color || 'var(--accent)');
            
            card.innerHTML = `
                <div class="card-header">
                    <h2 class="project-name">${project.name}</h2>
                </div>
                <p class="project-desc">${project.description || ''}</p>
                <div class="tags">
                    ${tagsHtml}
                </div>
                <div class="links-grid">
                    ${linksHtml}
                </div>
            `;

            grid.appendChild(card);
        });
    };

    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi tải dữ liệu:", error);
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #ef4444;">Lỗi khi tải dữ liệu từ Supabase. Vui lòng kiểm tra lại cấu hình Database.</p>';
        } else {
            renderProjects(data);
        }
    };

    // Load initial data
    fetchProjects();

    // Xử lý Thêm dự án
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang lưu...';

        const rawTags = document.getElementById('p-tags').value;
        const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(t => t) : [];

        const newProject = {
            name: document.getElementById('p-name').value,
            description: document.getElementById('p-desc').value,
            color: document.getElementById('p-color').value,
            domain: document.getElementById('p-domain').value || null,
            github: document.getElementById('p-github').value || null,
            vercel: document.getElementById('p-vercel').value || null,
            supabase: document.getElementById('p-supabase').value || null,
            tags: tags
        };

        const { error } = await supabase
            .from('projects')
            .insert([newProject]);

        submitBtn.disabled = false;
        submitBtn.innerText = 'Lưu Dự Án';

        if (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        } else {
            form.reset();
            modal.classList.remove('show');
            // Tải lại danh sách
            fetchProjects();
        }
    });
});
