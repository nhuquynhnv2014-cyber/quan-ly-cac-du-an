import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase client sử dụng biến môi trường của Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projects-grid');
    const modal = document.getElementById('add-modal');
    const modalTitle = document.getElementById('modal-title');
    const addBtn = document.getElementById('add-project-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-form');
    const submitBtn = document.getElementById('submit-btn');

    let allProjects = [];
    let editingProjectId = null;

    // Mở Modal Thêm mới
    addBtn.addEventListener('click', () => {
        editingProjectId = null;
        modalTitle.innerText = 'Thêm Dự Án Mới';
        form.reset();
        document.getElementById('p-color').value = '#4f46e5';
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
                    <div class="card-actions">
                        <button class="action-btn edit-btn" data-id="${project.id}" title="Chỉnh sửa"><i class='bx bx-edit'></i></button>
                        <button class="action-btn delete-btn" data-id="${project.id}" title="Xóa"><i class='bx bx-trash'></i></button>
                    </div>
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

        // Gắn sự kiện cho các nút Sửa/Xóa
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id));
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
            allProjects = data;
            renderProjects(data);
        }
    };

    // Hàm xử lý khi bấm Sửa
    const handleEdit = (id) => {
        const project = allProjects.find(p => p.id === id);
        if (!project) return;

        editingProjectId = id;
        modalTitle.innerText = 'Sửa Dự Án';

        document.getElementById('p-name').value = project.name || '';
        document.getElementById('p-desc').value = project.description || '';
        document.getElementById('p-color').value = project.color || '#4f46e5';
        document.getElementById('p-domain').value = project.domain || '';
        document.getElementById('p-github').value = project.github || '';
        document.getElementById('p-vercel').value = project.vercel || '';
        document.getElementById('p-supabase').value = project.supabase || '';
        document.getElementById('p-other').value = project.other_link || '';
        document.getElementById('p-tags').value = project.tags ? project.tags.join(', ') : '';

        modal.classList.add('show');
    };

    // Hàm xử lý khi bấm Xóa
    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.')) return;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Lỗi khi xóa: ' + error.message);
        } else {
            fetchProjects();
        }
    };

    // Load initial data
    fetchProjects();

    // Xử lý Thêm / Sửa dự án
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang lưu...';

        const rawTags = document.getElementById('p-tags').value;
        const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(t => t) : [];

        const projectData = {
            name: document.getElementById('p-name').value,
            description: document.getElementById('p-desc').value,
            color: document.getElementById('p-color').value,
            domain: document.getElementById('p-domain').value || null,
            github: document.getElementById('p-github').value || null,
            vercel: document.getElementById('p-vercel').value || null,
            supabase: document.getElementById('p-supabase').value || null,
            other_link: document.getElementById('p-other').value || null,
            tags: tags
        };

        let error;
        if (editingProjectId) {
            // Cập nhật
            const response = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingProjectId);
            error = response.error;
        } else {
            // Thêm mới
            const response = await supabase
                .from('projects')
                .insert([projectData]);
            error = response.error;
        }

        submitBtn.disabled = false;
        submitBtn.innerText = 'Lưu Dự Án';

        if (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        } else {
            form.reset();
            modal.classList.remove('show');
            editingProjectId = null;
            // Tải lại danh sách
            fetchProjects();
        }
    });
});
