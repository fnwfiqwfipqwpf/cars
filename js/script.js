fetch('js/image_sources.json')
    .then(response => response.json())
    .then(data => {
        const brandsElement = document.getElementById('brands');
        const modelsElement = document.getElementById('models');
        const yearsElement = document.getElementById('years');
        const imagesElement = document.getElementById('images');

        const brands = new Set();

        // Збираємо всі марки автомобілів
        Object.keys(data).forEach(path => {
            const [brand] = path.split('/');
            brands.add(brand);
        });

        // Сортуємо марки за алфавітом
        Array.from(brands)
            .sort()
            .forEach(brand => {
                const button = document.createElement('button');
                button.textContent = brand;
                button.onclick = () => loadModels(brand, data);
                brandsElement.appendChild(button);
            });

        function loadModels(brand, data) {
            modelsElement.innerHTML = '';
            yearsElement.innerHTML = '';
            imagesElement.innerHTML = '';

            const models = new Set(
                Object.keys(data)
                    .filter(path => path.startsWith(brand))
                    .map(path => path.split('/')[1])
            );

            models.forEach(model => {
                const button = document.createElement('button');
                button.textContent = model;
                button.onclick = () => loadYears(brand, model, data);
                modelsElement.appendChild(button);
            });
        }

        function loadYears(brand, model, data) {
            yearsElement.innerHTML = '';
            imagesElement.innerHTML = '';

            const years = new Set(
                Object.keys(data)
                    .filter(path => path.startsWith(`${brand}/${model}`))
                    .map(path => path.split('/')[2])
            );

            years.forEach(year => {
                const button = document.createElement('button');
                button.textContent = year;
                button.onclick = () => loadImages(brand, model, year, data);
                yearsElement.appendChild(button);
            });
        }

        function loadImages(brand, model, year, data) {
            imagesElement.innerHTML = '';

            const images = Object.keys(data).filter(path =>
                path.startsWith(`${brand}/${model}/${year}`)
            );

            const validImages = []; // Масив для збереження валідних зображень

            images.forEach(imagePath => {
                const img = document.createElement('img');
                img.src = data[imagePath];

                // Перевірка доступності зображення та його розміру
                img.onload = () => {
                    if (img.naturalWidth > 1 && img.naturalHeight > 1) {
                        imagesElement.appendChild(img); // Додаємо зображення, якщо воно не 1x1
                        validImages.push(data[imagePath]); // Додаємо до валідних зображень

                        // Додаємо подію для відкриття модального вікна
                        img.onclick = () => openModal(data[imagePath], validImages);
                    } else {
                        console.warn(`Image is 1x1 and will not be displayed: ${data[imagePath]}`);
                        delete data[imagePath]; // Видаляємо зображення 1x1 із даних
                    }
                };

                img.onerror = () => {
                    console.warn(`Image not found: ${data[imagePath]}`); // Лог помилки
                };
            });
        }

        let currentImageIndex = 0; // Індекс поточного зображення
        let imagePaths = []; // Масив шляхів до зображень

        // Функція для відкриття модального вікна
        function openModal(imageSrc, images) {
            const modal = document.getElementById('modal');
            const modalImage = document.getElementById('modalImage');
            modal.style.display = 'flex'; // Відображаємо модальне вікно
            modalImage.src = imageSrc; // Встановлюємо джерело зображення

            imagePaths = images; // Зберігаємо всі шляхи до зображень
            currentImageIndex = images.indexOf(imageSrc); // Встановлюємо поточний індекс

            modal.setAttribute('tabindex', '0'); // Додаємо можливість фокусу
            modal.focus(); // Встановлюємо фокус на модальне вікно
        }

        // Закриття модального вікна
        document.getElementById('closeModal').onclick = () => {
            const modal = document.getElementById('modal');
            modal.style.display = 'none'; // Ховаємо модальне вікно
            modal.setAttribute('tabindex', '-1'); // Забороняємо фокус після закриття
        };

        // Закриття модального вікна при кліку поза зображенням
        window.onclick = (event) => {
            const modal = document.getElementById('modal');
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('tabindex', '-1'); // Забороняємо фокус після закриття
            }
        };

        // Обробка подій клавіатури
        window.addEventListener('keydown', (event) => {
            const modal = document.getElementById('modal');
            if (modal.style.display === 'flex') {
                if (event.key === 'ArrowRight') {
                    // Перемикання на наступне зображення
                    showNextImage();
                } else if (event.key === 'ArrowLeft') {
                    // Перемикання на попереднє зображення
                    showPrevImage();
                }
            }
        });

        // Перемикання на наступне зображення
        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
            document.getElementById('modalImage').src = imagePaths[currentImageIndex];
        }

        // Перемикання на попереднє зображення
        function showPrevImage() {
            currentImageIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
            document.getElementById('modalImage').src = imagePaths[currentImageIndex];
        }

        // Додаємо події для стрілок
        document.getElementById('nextArrow').onclick = showNextImage;
        document.getElementById('prevArrow').onclick = showPrevImage;
    })
    .catch(error => console.error('Error loading data:', error));